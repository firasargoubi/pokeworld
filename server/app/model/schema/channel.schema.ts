import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChannelDocument = Channel & Document;

@Schema()
export class Channel {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ default: false })
    isDedicatedChannel: boolean;

    @Prop({ type: [String], default: [] })
    membersUsernames: string[];
}

export const channelSchema = SchemaFactory.createForClass(Channel);
