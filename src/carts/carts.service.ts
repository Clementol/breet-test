import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CartResponseDto } from './dto/cart-response.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartQuantityOptions, UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './schemas/cart.schema';
import { Product } from 'src/products/schemas/product.schemas';
import { Order } from 'src/orders/schemas/order.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CartsService {
  // private readonly logger = new Logger(CartsService.name);
  private readonly CARTS_CACHE_TTL  = 1_800_000;
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
     @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  create(createCartDto: CreateCartDto) {
    return 'This action adds a new cart';
  }

  async updateCartQty(userId: string, input: { productId: string; option: CartQuantityOptions }) {
    try {
      const { productId, option } = input;
      // let cartExist = await ;
      let [cartExist, productExist] = await Promise.all([
        this.cartModel.findOne({ user: userId }).lean<Cart>(),
        this.productModel.findOne({ _id: productId }),
      ]);

      if (!productExist) return Promise.reject(new BadRequestException('product not found!'));
      const existingItemIndex = cartExist?.items.findIndex(
        (item) => item.product.toString() == productId,
      ) as number;

      if (option == CartQuantityOptions.INC) {
        if (productExist?.availableStocks < 1)
          return Promise.reject(new BadRequestException('product out of stock'));

        if (existingItemIndex >= 0 && cartExist?.items?.[existingItemIndex]) {
          // const existingItem = cartExist?.items?.[existingItemIndex]
          cartExist.items[existingItemIndex].quantity =
            (cartExist?.items[existingItemIndex].quantity ?? 0) + 1;
        } else if (cartExist) {
          cartExist.items.push({ product: productId, quantity: 1 });
        } else {
          cartExist = { items: [{ product: productId, quantity: 1 }] } as Cart;
        }
      }
      if (option == CartQuantityOptions.DEC) {
        if (existingItemIndex >= 0 && cartExist?.items?.[existingItemIndex]) {
          const qty = cartExist?.items[existingItemIndex].quantity;
          if (qty - 1 > 0) cartExist.items[existingItemIndex].quantity = qty - 1;
          if (qty - 1 == 0)
            cartExist.items = cartExist.items.filter(
              (item) => item.product.toString() != productId,
            );
        } else {
          // when trying to descrease unavailable item
          return Promise.reject(new BadRequestException('Item not available in your cart!'));
        }
      }
      const updatedCart = (await this.cartModel
        .findOneAndUpdate(
          { user: userId },
          { items: cartExist?.items },
          { upsert: true, new: true },
        )
        .lean<Cart>()) as Cart;
      const cartKey = `cart:${userId}`;
      this.cacheManager.set(cartKey, updatedCart, this.CARTS_CACHE_TTL);
      
      return new CartResponseDto(updatedCart);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async processCheckOut(userId: string) {
    const cartExist = await this.cartModel.findOne({ user: userId }, {}, { })
    if (!cartExist) return Promise.reject(new BadRequestException('cart not available'))
    const orderItems = await this.updateStockQty({ cart: cartExist })

    return Promise.resolve({ orderItems })

  }

  private async updateStockQty(input:{ cart: Cart }) {
    const { user, items } = input.cart;
    // const [{ }] = items
    // let [productsExist, cartExist] = await Promise.all([
    //   this.productModel.find({ _id: productId }, {}, { readPreference: 'primary' }),
    //   this.cartModel.findOne({ user: userId }),
    // ]);
    const productUpdates: any[] = [];
    const orderItems: Order['items'] = [];
    const updatedcartItems: Cart['items'] = [];
    // let updatedCart: Cart
    
    if (items.length) {

      const session = await this.cartModel.startSession() //await mongoose.startSession({  });
     
      try {
          // console.log({ items })
          session.startTransaction()
          
          for (const { product, quantity } of items) {
            
            const productExist = await this.productModel.findOne({ _id: product.toString() }, {}, { session })
            console.log({ productExist })
            if (productExist && productExist.availableStocks > quantity) {
              productUpdates.push(
                this.productModel.findOneAndUpdate(
                 { _id: product, __v: productExist.__v },
                 { $inc: { __v: 1, availableStocks: -quantity } },
                 { session }
               )
              )
              
              updatedcartItems.push(...items.filter((item) => item.product.toString() != product));
            
              orderItems.push({
                product: product,
                quantity: quantity,
                price: productExist?.price * quantity,
              });
            }
          }

          // console.log({ ...productUpdates })
          // return

          // updatedCart = this.cartModel.findOneAndUpdate(
          //       { user: user },
          //       { items: updatedcartItems },
          //       { session },
          //     )
           await Promise.all([
            this.cartModel.findOneAndUpdate(
              { user: user },
              { items: updatedcartItems },
              { session },
            ),
            ...productUpdates, 
            orderItems.length ? this.orderModel.create([{ user, items: orderItems }, { session }]) : orderItems,
           ])


      
          //update cart
          // cartExist.items = cartExist.items.filter((item) => item.product.toString() != productId);
          // await Promise.all([
          //   await this.productModel.findOneAndUpdate(
          //     { _id: productId, __v: productExist.__v },
          //     { $inc: { __v: 1, availableStocks: -qty } },
          //     { session },
          //   ),
          //   this.cartModel.findOneAndUpdate(
          //     { user: userId },
          //     { items: cartExist.items },
          //     { session },
          //   ),
          //   this.orderModel.findOneAndUpdate(
          //     { user: userId },
          //     {
          //       $push: {
          //         items: {
          //           product: productId,
          //           quantity: qty,
          //           price: productExist.price * qty * 100,
          //         },
          //       },
          //     },
          //     { upsert: true, session },
          //   ),
          // ]);
        
        await session.commitTransaction()

      } catch (error) {
        await session.abortTransaction()
        return Promise.reject(error)
      } finally {
        session.endSession()
      }
    }

    return orderItems;
  }

  async findAll() {
    try {
      const cachedCarts = await this.cacheManager.get('carts')
      if (cachedCarts) return cachedCarts;
      const carts = await this.cartModel.find({}).lean();
      const cartDtos = carts.map((cart) => new CartResponseDto(cart));
      this.cacheManager.set('carts', cartDtos, this.CARTS_CACHE_TTL)
      return cartDtos;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findByUserId(id: string) {
    try {
      const cartKey = `cart:${id}`;
      const cachedCart = await this.cacheManager.get(cartKey);
      if (cachedCart) return cachedCart;
      const userCartExist = await this.cartModel.findOne({ user: id }).lean();
      if (!userCartExist) return Promise.reject('user cart not found');
      const cartDto = new CartResponseDto(userCartExist);
       this.cacheManager.set(cartKey, cartDto, this.CARTS_CACHE_TTL);
      return cartDto;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
