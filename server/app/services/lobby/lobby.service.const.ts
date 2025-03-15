import { MapSize } from '@common/map-size.enum';

export const HALF_POINT = 0.5;

export const MIN_PLAYERS = 2;

export const MAX_PLAYERS = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};
