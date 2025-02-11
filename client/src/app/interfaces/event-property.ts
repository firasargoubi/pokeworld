import { ItemType } from '@common/item-type.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

export interface EventProperty {
    tilePosition: Position | null;
    mousePosition: Position | null;
    tile: TileType | null;
    item: ItemType | null;
}
