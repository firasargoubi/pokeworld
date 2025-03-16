import { TileType } from '@common/tile-type.enum';

export const BATTLE_PLATFORM_DATA = {
    [TileType.Grass]: {
        selfPlatform: './assets/images/game/battle-platforms/self-grass.png',
        enemyPlatform: './assets/images/game/battle-platforms/ennemy-grass.png',
    },
    [TileType.Bush]: {
        selfPlatform: './assets/images/game/battle-platforms/self-bush.png',
        enemyPlatform: './assets/images/game/battle-platforms/ennemy-bush.png',
    },
    [TileType.Path]: {
        selfPlatform: './assets/images/game/battle-platforms/self-path.png',
        enemyPlatform: './assets/images/game/battle-platforms/ennemy-path.png',
    },
    [TileType.Bridge]: {
        selfPlatform: './assets/images/game/battle-platforms/self-bridge.png',
        enemyPlatform: './assets/images/game/battle-platforms/ennemy-bridge.png',
    },
    [TileType.BrokenBridge]: {
        selfPlatform: './assets/images/game/battle-platforms/self-grass.png',
        enemyPlatform: './assets/images/game/battle-platforms/ennemy-grass.png',
    },
    [TileType.Water]: {
        selfPlatform: './assets/images/game/battle-platforms/self-grass.png',
        enemyPlatform: './assets/images/game/battle-platforms/ennemy-grass.png',
    },
    [TileType.None]: {
        selfPlatform: './assets/images/game/battle-platforms/self-grass.png',
        enemyPlatform: './assets/images/game/battle-platforms/ennemy-grass.png',
    },
};
