import { INITIAL_USER_BALANCE } from '@common/consts/shop.const';
import { UserChallengeData } from '@common/interfaces/challenge-data';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';
import { InventoryItem } from '@common/interfaces/shop';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export class InventoryItemSchema implements InventoryItem {
    @Prop({ required: true })
    itemId: string;

    @Prop({ required: true })
    price: number;
}

export class ChallengeSchema implements UserChallengeData {
    @Prop({ required: true })
    challenge: string;

    @Prop({ required: true })
    completed: number;
}

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
    fullProfilePicture: string;

    @Prop({ required: true, default: INITIAL_USER_BALANCE })
    balance: number;

    @Prop({ type: [InventoryItemSchema], default: [] })
    inventory: InventoryItemSchema[];

    @Prop({ type: [ChallengeSchema], default: [] })
    challenges: ChallengeSchema[];

    @Prop({ required: true, default: false })
    isLoggedIn: boolean;

    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ required: true, default: false })
    deleted: boolean;

    @Prop({ type: UserPreferencesSchema, default: () => ({ theme: AppTheme.Default, language: AppLanguage.French }) })
    preferences: UserPreferencesSchema;

    @Prop({ default: 0 })
    tutorialStep: number;
}

export const userSchema = SchemaFactory.createForClass(User);
