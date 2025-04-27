import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, optimisticConcurrency: true })
export class Product {
    _id: MongooseSchema.Types.ObjectId;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, required: true, min: 1 })
    price: number;

    @Prop({ type: Number, required: true, min: 1, default: 20 })
    availableStocks: number;

    @Prop({ type: String, required: true, min: 1 })
    category: string;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date

}

export const ProductSchema = SchemaFactory.createForClass(Product);
