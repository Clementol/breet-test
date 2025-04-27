import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from 'mongoose';

enum Gender {
 Male = 'male',
 Female = 'female'
}
@Schema({ versionKey: false })
export class User {
 _id: MongooseSchema.Types.ObjectId;

 @Prop({ required: true })
 firstName: string;

 @Prop({ required: true })
 lastName: string;

 @Prop({ required: true })
 email: string;

 @Prop({ required: true, enum: Gender })
 gender: string;
 
 @Prop({ required: true })
 phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);