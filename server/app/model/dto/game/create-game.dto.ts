import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MapSize } from '@common/map-size.enum';
import { GameMode } from '@common/game-mode.enum';
import { TileType } from '@common/tile-type.enum';
import { ItemType } from '@common/item-type.enum';
import { Position } from '@common/position';
import { GAME_NAME_MAX_LENGTH, GAME_DESCRIPTION_MAX_LENGTH } from './game.dto.constants';
// CHECK
export class MapData {
    @ApiProperty()
    @ValidateNested({ each: true })
    tiles: TileType[][];

    @ApiProperty()
    @IsObject()
    items: Record<ItemType, Position[]>;

    @ApiProperty({ enum: MapSize })
    @IsEnum(MapSize)
    size: MapSize;

    @ApiProperty({ enum: GameMode })
    @IsEnum(GameMode)
    gameMode: GameMode;
}

export class CreateGameDto {
    @ApiProperty({ maxLength: GAME_NAME_MAX_LENGTH })
    @IsString()
    @MaxLength(GAME_NAME_MAX_LENGTH)
    name: string;

    @ApiProperty({ maxLength: GAME_DESCRIPTION_MAX_LENGTH })
    @IsString()
    @MaxLength(GAME_DESCRIPTION_MAX_LENGTH)
    description: string;

    @ApiProperty()
    @IsDate()
    lastEdited: Date;

    @ApiProperty()
    @IsBoolean()
    isVisible: boolean;

    @ApiProperty()
    @IsString()
    thumbnail: string;

    @ApiProperty()
    @Type(() => MapData)
    mapData: MapData;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    _id?: string;
}
