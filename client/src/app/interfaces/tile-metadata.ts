import { TileType } from '@common/tile-type.enum';
import { getImagePath, MetaData } from './meta-data';

const tileImagesPrefix = 'assets/images/game/tiles';

type Tile = MetaData;
const tileIndex = {
    [TileType.Path]: {
        description: 'Chemin',
        image: getImagePath(tileImagesPrefix, 'path'),
    },
    [TileType.Bridge]: {
        description: 'Pont',
        image: getImagePath(tileImagesPrefix, 'bridge'),
    },
    [TileType.Water]: {
        description: 'Eau',
        image: getImagePath(tileImagesPrefix, 'water'),
    },
    [TileType.Bush]: {
        description: 'Buisson',
        image: getImagePath(tileImagesPrefix, 'bush'), // temporary
    },
} as { [key: string]: Tile };

export { tileIndex };
