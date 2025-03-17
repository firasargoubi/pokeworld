import { TileType } from '@common/tile-type.enum';

export const MOCK_NEW_SECTION: TileType[][] = [
    [TileType.Grass, TileType.Water, TileType.Grass, TileType.Grass],
    [TileType.Grass, TileType.BrokenBridge, TileType.Grass, TileType.Grass],
    [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
    [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
];

export const MOCK_BLOCKED_MAP_TILES: TileType[][] = [
    [TileType.Grass, TileType.Water, TileType.Grass],
    [TileType.Water, TileType.Water, TileType.Water],
    [TileType.Grass, TileType.Water, TileType.Grass],
];
