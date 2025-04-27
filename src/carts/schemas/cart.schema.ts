import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ versionKey: false, _id: false })
export class CartItems {
    @Prop({ type:  MongooseSchema.Types.ObjectId, ref: 'products' })
    product:  MongooseSchema.Types.ObjectId | string;

    @Prop({ type: Number, min: 0, default: 0 })
    quantity: number;
}
const CartItemSchema = SchemaFactory.createForClass(CartItems);

@Schema({ versionKey: false, timestamps: true })
export class Cart {
    _id: MongooseSchema.Types.ObjectId;

    @Prop({ type:  MongooseSchema.Types.ObjectId, ref: 'users', index: true })
    user:  MongooseSchema.Types.ObjectId;

    @Prop({ type: [{ type: CartItemSchema }], default: [] })
    items: CartItems[]
}

export const CartSchema = SchemaFactory.createForClass(Cart);

