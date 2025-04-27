import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schemas';
import * as productsData from '../../mockData/products.json'
import { InjectModel } from '@nestjs/mongoose';
import { ProductResponseDto } from './dto/response.product.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


@Injectable()
export class ProductsService {

    private readonly logger = new Logger(ProductsService.name);
    private readonly PRODUCTS_CACHE_TTL  = 1_800_000;
    constructor(
      @InjectModel(Product.name) private readonly productModel: Model<Product>,
      @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

  async create(createProductDto?: CreateProductDto) {
    
    try {
      this.logger.log('products data setup')
      const productsCount = await this.productModel.countDocuments({});
      // const productsCount = await this.productModel.deleteMany({});
      if (productsCount < 1) {
        const editedProd = productsData.map((product) => ({ ...product, price: +product.price * 100, availableStocks: +product.availableStocks }))
        const _ = await this.productModel.insertMany(editedProd);
        // this.logger.log('products added to database collection')
      }
      const products = await this.productModel.find({})
      await this.cacheManager.set('products', products.map(product => new ProductResponseDto(product)), this.PRODUCTS_CACHE_TTL)
    } catch (error) {
      // this.logger.log('error inserting products to database collection' + error)
      return Promise.reject(error)
    }
  }

  async findAll() {
    try {

      const cachedProducts = await this.cacheManager.get('products');
      if (cachedProducts) return cachedProducts;
      const products = await this.productModel.find({}).lean();
      const productDtos = products.map(product => new ProductResponseDto(product))
      this.cacheManager.set('products', productDtos, this.PRODUCTS_CACHE_TTL)
      return productDtos
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOne(id: string) {
    try {
      const productExist = await this.productModel.findOne({ _id: id }).lean<Product>();
      if (!productExist) return Promise.reject(new BadRequestException('product not found'));
      return new ProductResponseDto(productExist)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
