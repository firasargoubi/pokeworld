import { Tile } from './Tile';
import { Size } from './Size.enum';
import { GameMode } from './GameMode.enum';

export interface MapData {
    tiles: Tile[][];
    size: Size;
    gameMode: GameMode;
}
