import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

// TODO verifier si on peut mettre les constantes dans common pour ne pas eviter la duplication de fichiers de contantes entre le front et le back

export const MOCK_GAMES: GameData[] = [
    {
        _id: '123',
        name: 'Game 1',
        isVisible: true,
        description: 'Description 1',
        lastEdited: new Date(),
        mapData: {
            tiles: Array.from({ length: MapSize.Medium }, () => Array(MapSize.Medium).fill(TileType.Grass)),
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Medium,
            gameMode: GameMode.CTF,
        },
    },
    {
        _id: '456',
        name: 'Game 2',
        isVisible: true,
        description: 'Description 2',
        lastEdited: new Date(),
        mapData: {
            tiles: Array.from({ length: MapSize.Large }, () => Array(MapSize.Large).fill(TileType.Grass)),
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Large,
            gameMode: GameMode.CTF,
        },
    },
    {
        _id: '789',
        name: 'Game 3',
        isVisible: true,
        description: 'Description 3',
        lastEdited: new Date(),
        mapData: {
            tiles: Array.from({ length: MapSize.Small }, () => Array(MapSize.Small).fill(TileType.Grass)),
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Small,
            gameMode: GameMode.FFA,
        },
    },
];
