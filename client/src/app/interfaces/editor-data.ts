import { ItemType } from '@common/item-type.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

export interface EditorTile {
    tile: TileType;
    image: string;
    description: string;
    isActive: boolean;
}

export interface EditorItem {
    item: ItemType;
    image: string;
    description: string;
    count: number;
}

export interface EditorData {
    tiles: EditorTile[];
    items: EditorItem[];
    selectedTile: TileType | null;
    activeTile: TileType | null;
    activeTilePosition: Position;
    activeItem: ItemType | null;
    activeItemImage: string;
    activeItemPosition: Position;
}
