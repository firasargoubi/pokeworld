import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { MapData } from '@common/map-data';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    // CHECK cover on this line
    @Prop({ required: true, default: () => new Date() })
    lastEdited: Date;

    @ApiProperty()
    @Prop({ required: true, default: true })
    isVisible: boolean;

    @ApiProperty()
    @Prop({ required: true })
    thumbnail: string;

    @ApiProperty()
    @Prop({ required: true, type: Object })
    mapData: MapData;

    @ApiProperty()
    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);
