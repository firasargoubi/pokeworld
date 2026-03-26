import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRelationshipsDocument = UserRelationships & Document;

@Schema()
export class UserRelationships {
    @Prop({ required: true, unique: true, index: true })
    userId: string;

    @Prop({ type: [String], default: [] })
    friends: string[];

    @Prop({ type: [String], default: [] })
    pendingRequestsSent: string[];

    @Prop({ type: [String], default: [] })
    pendingRequestsReceived: string[];

    @Prop({ type: [String], default: [] })
    blockedUsers: string[];

    @Prop({ type: [String], default: [] })
    blockedByUsers: string[];
}

export const userRelationshipsSchema = SchemaFactory.createForClass(UserRelationships);
userRelationshipsSchema.index({ userId: 1 }, { unique: true });
