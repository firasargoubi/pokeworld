import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';

export const MAX_NAME_LENGTH = 20;
export const MAX_DESCRIPTION_LENGTH = 350;
export const MIN_TERRAIN_RATIO = 0.5;

export const REQUIRED_SPAWN_POINTS: Record<MapSize, number> = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};

export const BRIDGE_TYPES = new Set([TileType.Bridge, TileType.BrokenBridge]);
