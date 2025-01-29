import { TileType } from './tile-type.enum';
import { MapSize } from './map-size.enum';
import { GameMode } from './game-mode.enum';
import { ItemData } from './item-data';

export interface MapData {
    tiles: TileType[][];
    itemData: ItemData;
    size: MapSize;
    gameMode: GameMode;
}
