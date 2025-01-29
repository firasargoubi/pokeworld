import { GameMode } from './game-mode.enum';
import { TileType } from './tile-type.enum';
import { ItemData } from './item-data';
import { MapSize } from './map-size.enum';

export interface MapData {
    tiles: TileType[][];
    itemData: ItemData;
    size: MapSize;
    gameMode: GameMode;
}
