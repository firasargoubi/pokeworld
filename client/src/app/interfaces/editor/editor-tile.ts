import { TileType } from '@common/tile-type.enum';

export interface EditorTile {
    tile: TileType;
    image: string;
    isActive: boolean;
}
