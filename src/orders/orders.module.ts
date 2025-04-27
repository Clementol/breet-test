import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), OrdersService]
})
export class OrdersModule {}
