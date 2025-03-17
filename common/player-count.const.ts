import { MapSize } from './map-size.enum';

export const MIN_PLAYERS = 2;

export const MAX_PLAYERS = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};
