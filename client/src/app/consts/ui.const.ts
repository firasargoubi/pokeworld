import { MapSize } from '@common/interfaces/map-data';

export const TABLET_BREAKPOINT = 600;

export const GAME_CARD_ROW_LENGTHS = {
    tablet: 2,
    desktop: 3,
};

export const POKE_BUTTON_DEFAULT_SCALE = 1;

export const CARD_SIZE_TO_COLOR: Record<MapSize, string> = {
    [MapSize.Small]: 'blue-card',
    [MapSize.Medium]: 'green-card',
    [MapSize.Large]: 'pink-card',
};
