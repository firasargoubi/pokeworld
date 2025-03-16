import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';

export interface TileVisualData {
    tile: string;
    underlay: string | null;
    item: ItemType | null;
    player: string | null;
    overlay: string | null;
}

export interface MapVisualData {
    tiles: TileVisualData[][];
    size: MapSize;
}

export interface OverlayTiles {
    possibleMoves: Position[];
    hoverMoves: Position[];
    actions: Position[];
    playerPosition: Position;
}
