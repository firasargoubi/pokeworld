import { GameData } from '@common/interfaces/game-data';
import { GameState } from '@common/interfaces/game-state.enum';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';

export const DEFAULT_GAME_DATA: GameData = {
    _id: '',
    name: '',
    description: '',
    owner: { userId: '', userName: '' },
    gameState: GameState.PUBLIC,
    lastEdited: new Date(),
    mapData: {
        items: {
            [ItemType.Item1]: [],
            [ItemType.Item2]: [],
            [ItemType.Item3]: [],
            [ItemType.Item4]: [],
            [ItemType.Item5]: [],
            [ItemType.Item6]: [],
            [ItemType.Random]: [],
            [ItemType.Spawn]: [],
            [ItemType.Flag]: [],
        },
        tiles: [],
        size: MapSize.Small,
        gameMode: GameMode.FFA,
    },
};

export const GAME_STATE_KEYS: Record<GameState, string> = {
    [GameState.PUBLIC]: 'pages.edit.public',
    [GameState.PRIVATE]: 'pages.edit.private',
    [GameState.PRIVATE_SHARED]: 'pages.edit.privateShared',
};
