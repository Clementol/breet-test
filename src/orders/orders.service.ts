import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OrdersService {
  private readonly ORDERS_CACHE_TTL  = 1_800_000;

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findAll() {
    try {
      const orders = await this.orderModel.find({}, { _id: 0 }).lean<Order[]>()

      return orders
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findByUserId(id: string) {
    try {
      const orderKey = `order:${id}`
      const cachedOrders = await this.cacheManager.get(orderKey);
      if (cachedOrders) return cachedOrders;
      const orders = await this.orderModel.find({ user: id }, { _id: 0 }).lean<Order[]>()
      this.cacheManager.set(orderKey, orders, this.ORDERS_CACHE_TTL)
      return orders;
    } catch (error) {
      
    }
    return `This action returns a #${id} order`;
  }

  findOne(id: string) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
