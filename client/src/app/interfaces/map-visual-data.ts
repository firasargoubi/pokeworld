import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';

export interface TileVisualData {
    tile: string;
    underlay: string | null;
    item: ItemType | null;
    player: string | null;
}

export interface MapVisualData {
    tiles: TileVisualData[][];
    size: MapSize;
}
