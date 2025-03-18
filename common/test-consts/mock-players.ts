import { Avatar } from '../interfaces/avatar.enum';
import { DiceType } from '../interfaces/dice';
import { CurrentStats, Player, PlayertStats } from '../interfaces/player';
import { TileType } from '../interfaces/tile-type.enum';

export const MOCK_PLAYER_STATS: PlayertStats[] = [
    {
        health: 6,
        speed: 4,
        attack: 4,
        defense: 4,
        attackDice: DiceType.D6,
        defenseDice: DiceType.D4,
        escapes: 2,
    },
    {
        health: 4,
        speed: 6,
        attack: 4,
        defense: 4,
        attackDice: DiceType.D4,
        defenseDice: DiceType.D6,
        escapes: 2,
    },
];

export const MOCK_CURRENT_STATS: CurrentStats[] = [
    {
        health: 6,
        speed: 4,
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
        standingTile: TileType.Grass,
    },
    {
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
        standingTile: TileType.Grass,
    },
];

export const PLAYER_IDS = ['3333', '4444', '5555', '6666'];

export const MOCK_PLAYERS: Player[] = [
    {
        id: structuredClone(PLAYER_IDS[0]),
        name: 'Player1',
        avatar: Avatar.Avatar1,
        playerStats: structuredClone(MOCK_PLAYER_STATS[0]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[0]),
        isAdmin: true,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 1, y: 2 },
    },
    {
        id: structuredClone(PLAYER_IDS[1]),
        name: 'Player2',
        avatar: Avatar.Avatar2,
        playerStats: structuredClone(MOCK_PLAYER_STATS[1]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[1]),
        isAdmin: false,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 1, y: 2 },
    },
    {
        id: structuredClone(PLAYER_IDS[2]),
        name: 'P3',
        avatar: Avatar.Avatar3,
        playerStats: structuredClone(MOCK_PLAYER_STATS[1]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[1]),
        isAdmin: false,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 2, y: 2 },
    },
    {
        id: structuredClone(PLAYER_IDS[3]),
        name: 'P4',
        avatar: Avatar.Avatar4,
        playerStats: structuredClone(MOCK_PLAYER_STATS[1]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[1]),
        isAdmin: false,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 3, y: 3 },
    },
];
