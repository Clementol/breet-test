import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class OrederItems {
    @Prop({ type:  MongooseSchema.Types.ObjectId, ref: 'products' })
    product:  MongooseSchema.Types.ObjectId | string;

    @Prop({ type: Number, required: true, min: 0, default: 0 })
    quantity: number;

    @Prop({ type: Number,required: true, min: 0, default: 0 })
    price: number;
}
const OrderItemSchema = SchemaFactory.createForClass(OrederItems);

@Schema({ versionKey: false, timestamps: true })
export class Order {
    _id: MongooseSchema.Types.ObjectId;
    
    @Prop({ type:  MongooseSchema.Types.ObjectId, ref: 'users', index: true })
    user:  MongooseSchema.Types.ObjectId;

    @Prop({ type: [{ type: OrderItemSchema }], default: [] })
    items: OrederItems[]
}
export const OrderSchema = SchemaFactory.createForClass(Order);