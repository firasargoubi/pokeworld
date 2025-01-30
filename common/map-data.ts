import { GameMode } from './game-mode.enum';
import { ItemType } from './item-type.enum';
import { MapSize } from './map-size.enum';
import { Position } from './position';
import { TileType } from './tile-type.enum';

export interface MapData {
    tiles: TileType[][];
    items: Record<ItemType, Position[]>;
    size: MapSize;
    gameMode: GameMode;
}
