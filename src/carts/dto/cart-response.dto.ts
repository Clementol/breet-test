import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Cart, CartItems } from '../schemas/cart.schema';

class CartItemsDto {
  product: string;

  // @IsNotEmpty()
  // @IsNumber()
  quantity: number;
  constructor(data: CartItems) {
    this.product = data.product.toString();
    this.quantity = data.quantity;
  }
}
export class CartResponseDto {
  id: string;

  user: string;

  items: CartItemsDto[];

  constructor(data: Cart) {
    this.id = data?._id.toString();
    this.user = data?.user.toString();
    this.items = data?.items.length
      ? data.items.map((item) => new CartItemsDto(item))
      : [];
  }
}
