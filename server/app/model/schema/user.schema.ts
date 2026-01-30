import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @ApiProperty()
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true, default: false })
    isLoggedIn: boolean;

    @Prop({ required: true, unique: true })
    userId: string;
}

export const userSchema = SchemaFactory.createForClass(User);
