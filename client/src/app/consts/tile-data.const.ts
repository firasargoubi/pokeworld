import { TileType } from '@common/interfaces/tile-type.enum';

export const TILE_DESCRIPTION: Map<TileType, string> = new Map([
    [TileType.Path, 'tiles.description.path'],
    [TileType.Bush, 'tiles.description.bush'],
    [TileType.Water, 'tiles.description.water'],
    [TileType.Bridge, 'tiles.description.bridge'],
    [TileType.BrokenBridge, 'tiles.description.brokenBridge'],
]);

export const RIGHT_CLICK_TILE_DESCRIPTION: Map<TileType, string> = new Map([
    [TileType.Grass, 'tiles.rightClick.grass'],
    [TileType.Path, 'tiles.rightClick.path'],
    [TileType.Bush, 'tiles.rightClick.bush'],
    [TileType.Water, 'tiles.rightClick.water'],
    [TileType.Bridge, 'tiles.rightClick.bridge'],
    [TileType.BrokenBridge, 'tiles.rightClick.brokenBridge'],
]);

export const TILE_EFFECT: Record<TileType, string> = {
    [TileType.Grass]: 'tiles.effect.grass',
    [TileType.Path]: 'tiles.effect.path',
    [TileType.Bush]: 'tiles.effect.bush',
    [TileType.Water]: 'tiles.effect.water',
    [TileType.Bridge]: 'tiles.effect.bridge',
    [TileType.None]: 'tiles.effect.none',
    [TileType.BrokenBridge]: 'tiles.effect.brokenBridge',
};
