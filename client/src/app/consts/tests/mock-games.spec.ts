import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';

export const MOCK_GAMES: GameData[] = [
    {
        _id: '123',
        name: 'Game 1',
        isVisible: true,
        description: 'Description 1',
        lastEdited: new Date(),
        mapData: {
            tiles: [],
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Medium,
            gameMode: GameMode.CTF,
        },
        thumbnail: 'path',
    },
    {
        _id: '456',
        name: 'Game 2',
        isVisible: true,
        description: 'Description 2',
        lastEdited: new Date(),
        mapData: {
            tiles: [],
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Large,
            gameMode: GameMode.CTF,
        },
        thumbnail: 'path',
    },
];
