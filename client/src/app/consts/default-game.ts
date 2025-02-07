import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';

export const EMPTY_GAME_DATA: GameData = {
    _id: '',
    name: '',
    description: '',
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
    thumbnail: '',
};
