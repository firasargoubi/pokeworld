import { TileType } from './TileType.enum';
import { Item } from './Item';

export interface Tile {
    type: TileType;
    item?: Item;
}
