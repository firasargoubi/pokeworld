import { TileType } from '@common/tile-type.enum';

export const TILE_EFFECT: Record<TileType, string> = {
    [TileType.Grass]: 'Normal',
    [TileType.Path]: 'Accélère mouvement',
    [TileType.Bush]: 'Ralenti le mouvement',
    [TileType.Water]: 'Bloque le passage',
    [TileType.Bridge]: 'Traversable',
    [TileType.None]: 'Aucun effet',
    [TileType.BrokenBridge]: 'Non traversable',
};
