import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { ProductsModule } from 'src/products/products.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductsModule, OrdersModule
  ],
  controllers: [ CartsController],
  providers: [CartsService]
})
export class CartsModule {}
