import { TILE_IMAGES } from '@app/consts/images.const';
import { TILE_DESCRIPTION } from '@app/consts/tiles.const';
import { EditorTile } from '@app/interfaces/editor-data';
import { ItemType } from '@common/item-type.enum';
import { TileType } from '@common/tile-type.enum';

export const DEFAULT_EDITOR_TILES: EditorTile[] = [
    {
        tile: TileType.Path,
        image: TILE_IMAGES.get(TileType.Path) as string,
        description: TILE_DESCRIPTION.get(TileType.Path) as string,
        isActive: false,
    },
    {
        tile: TileType.Bush,
        image: TILE_IMAGES.get(TileType.Bush) as string,
        description: TILE_DESCRIPTION.get(TileType.Bush) as string,
        isActive: false,
    },
    {
        tile: TileType.Water,
        image: TILE_IMAGES.get(TileType.Water) as string,
        description: TILE_DESCRIPTION.get(TileType.Water) as string,
        isActive: false,
    },
    {
        tile: TileType.BrokenBridge,
        image: TILE_IMAGES.get(TileType.BrokenBridge) as string,
        description: TILE_DESCRIPTION.get(TileType.BrokenBridge) as string,
        isActive: false,
    },
];

export const EDITOR_ERASE_TILE: TileType = TileType.Grass;

export const SHARED_ITEM_POOL: ItemType[] = [
    ItemType.Item1,
    ItemType.Item2,
    ItemType.Item3,
    ItemType.Item4,
    ItemType.Item5,
    ItemType.Item6,
    ItemType.Random,
];
export const ITEM_POOL_HIGHEST_ITEM: ItemType = ItemType.Random;
