import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GAME_DESCRIPTION_MAX_LENGTH, GAME_NAME_MAX_LENGTH } from './game.dto.constants';
import { GameState } from '@common/interfaces/game-state.enum';

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

    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    maxActions?: number;
}

export class Owner {
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsString()
    userName: string;
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
    @IsOptional()
    @IsObject()
    owner: Owner;

    @ApiProperty()
    @IsEnum(GameState)
    gameState: GameState;

    @ApiProperty()
    @IsString()
    lastEdited: Date;

    @ApiProperty()
    @IsObject()
    mapData: MapData;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    _id?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    thumbnail?: string;
}
