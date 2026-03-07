import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export class UserPreferencesSchema {
    @Prop({ type: String, enum: Object.values(AppTheme), default: AppTheme.Default })
    theme: AppTheme;

    @Prop({ type: String, enum: Object.values(AppLanguage), default: AppLanguage.French })
    language: AppLanguage;
}

@Schema()
export class User {
    @ApiProperty()
    @Prop({ required: true })
    username: string;

    @Prop()
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop()
    profilePicture: string;

    @Prop()
    balance: number;

    @Prop({ required: true, default: false })
    isLoggedIn: boolean;

    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ required: true, default: false })
    deleted: boolean;

    @Prop({ type: UserPreferencesSchema, default: () => ({ theme: AppTheme.Default, language: AppLanguage.French }) })
    preferences: UserPreferencesSchema;
}

export const userSchema = SchemaFactory.createForClass(User);
