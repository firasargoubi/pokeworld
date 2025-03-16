import { Avatars } from '@common/avatars.enum';
import { DiceType } from '@common/dice';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Player } from '@common/player';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

export const DEBUG_GAMES = [
    {
        _id: '1190',
        name: 'Game 1 Small',
        isVisible: true,
        description: 'Description 1 Small',
        lastEdited: new Date(),
        mapData: {
            tiles: Array.from({ length: MapSize.Small }, () => Array(MapSize.Small).fill(TileType.Grass)),
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Small,
            gameMode: GameMode.FFA,
        },
    },
    {
        _id: '2290',
        name: 'Game 2 Medium',
        isVisible: true,
        description: 'Description 2 Medium',
        lastEdited: new Date(),
        mapData: {
            tiles: Array.from({ length: MapSize.Medium }, () => Array(MapSize.Medium).fill(TileType.Grass)),
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Medium,
            gameMode: GameMode.FFA,
        },
    },
    {
        _id: '3390',
        name: 'Game 3 Large',
        isVisible: true,
        description: 'Description 3 Large',
        lastEdited: new Date(),
        mapData: {
            tiles: Array.from({ length: MapSize.Large }, () => Array(MapSize.Large).fill(TileType.Grass)),
            items: {} as Record<ItemType, Position[]>,
            size: MapSize.Large,
            gameMode: GameMode.FFA,
        },
    },
];

export const DEBUG_PLAYERS: Partial<Player>[] = [
    {
        name: 'Aziz',
        avatar: Avatars.Avatar1,
        isConnected: true,
    },
    {
        name: 'Selim',
        avatar: Avatars.Avatar2,
        isConnected: true,
        playerStats: {
            health: 4,
            speed: 6,
            attack: 4,
            defense: 4,
            attackDice: DiceType.D4,
            defenseDice: DiceType.D6,
            escapes: 2,
        },
        currentStats: {
            health: 4,
            speed: 6,
            attack: 4,
            defense: 4,
            escapes: 2,
            attackBonus: 0,
            defenseBonus: 0,
            items: [],
            position: { x: 0, y: 0 },
            movement: 0,
            hasAction: false,
            fightsWon: 0,
            standingTile: TileType.Path,
        },
    },
    {
        name: 'Mathieu',
        avatar: Avatars.Avatar3,
        isConnected: true,
    },
    {
        name: 'Omar',
        avatar: Avatars.Avatar4,
        isConnected: true,
    },
];
