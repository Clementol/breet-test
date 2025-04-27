import { Product } from '../schemas/product.schemas';

export class ProductResponseDto {
  id: string;

  name: string;

  price: number;

  availableStocks: number;

  category: string;

  constructor(data: Product) {
    this.id = data._id.toString();
    this.name = data.name;
    this.price = data.price;
    this.availableStocks = data.availableStocks;
    this.category = data.category;
  }
}
