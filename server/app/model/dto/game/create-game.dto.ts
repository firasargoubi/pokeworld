import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MapSize } from '@common/interfaces/map-size.enum';
import { GameMode } from '@common/interfaces/game-mode.enum';
import { TileType } from '@common/interfaces/tile-type.enum';
import { ItemData } from '@common/interfaces/item-data';
import { GAME_NAME_MAX_LENGTH, GAME_DESCRIPTION_MAX_LENGTH } from './game.dto.constants';
// CHECK
export class MapData {
    @ApiProperty()
    @ValidateNested({ each: true })
    tiles: TileType[][];

    @ApiProperty()
    @IsObject()
    itemData: ItemData;

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
