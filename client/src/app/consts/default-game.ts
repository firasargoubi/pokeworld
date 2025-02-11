import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';

export const DEFAULT_GAME: GameData = {
    _id: '',
    name: 'Jeu par defaut',
    description: 'Description par defaut',
    lastEdited: new Date(),
    isVisible: false,
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
