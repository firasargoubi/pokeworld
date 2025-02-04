import { ItemType } from '@common/item-type.enum';
import { TileType } from '@common/tile-type.enum';

export type ToolBoxElement = TileType | ItemType;
export type ToolBoxSet = { tileType: TileType | null; itemType: ItemType | null };
