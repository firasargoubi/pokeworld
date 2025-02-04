import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { TileType } from '@common/tile-type.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { GameMode } from '@common/game-mode.enum';
import { Position } from '@common/position';

export type GameDocument = Game & Document;

export class MapData {
    @ApiProperty()
    @Prop({ required: true, type: Array })
    tiles: TileType[][];

    @ApiProperty()
    @Prop({ required: true, type: Object })
    items: Record<ItemType, Position[]>;

    @ApiProperty({ enum: MapSize })
    @Prop({ required: true })
    size: MapSize;

    @ApiProperty({ enum: GameMode })
    @Prop({ required: true })
    gameMode: GameMode;
}

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
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
