import { Avatars } from '@common/avatars.enum';
import { DiceType } from '@common/dice';
import { Match, MatchData, TurnPhase } from '@common/match';
import { CurrentStats, Player, PlayertStats } from '@common/player';
import { TileType } from '@common/tile-type.enum';
import { MOCK_GAMES } from './mock-games';

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

export const MOCK_PLAYERS: Player[] = [
    {
        id: '3333',
        name: 'Player1',
        avatar: Avatars.Avatar1,
        playerStats: structuredClone(MOCK_PLAYER_STATS[0]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[0]),
        isAdmin: true,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 3, y: 3 },
    },
    {
        id: '4444',
        name: '',
        avatar: Avatars.Avatar2,
        playerStats: structuredClone(MOCK_PLAYER_STATS[1]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[1]),
        isAdmin: false,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 4, y: 4 },
    },
    {
        id: '5555',
        name: 'Player1',
        avatar: Avatars.Avatar1,
        playerStats: structuredClone(MOCK_PLAYER_STATS[0]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[0]),
        isAdmin: true,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 5, y: 5 },
    },
    {
        id: '6666',
        name: '',
        avatar: Avatars.Avatar2,
        playerStats: structuredClone(MOCK_PLAYER_STATS[1]),
        currentStats: structuredClone(MOCK_CURRENT_STATS[1]),
        isAdmin: false,
        isConnected: true,
        isBot: false,
        spawnPoint: { x: 6, y: 6 },
    },
];

export const MOCK_MATCH_DATAS: MatchData[] = [
    {
        code: '1111',
        isDebugMode: false,
        isStarted: false,
        isLocked: false,
        activePlayer: 0,
        players: [structuredClone(MOCK_PLAYERS[0]), structuredClone(MOCK_PLAYERS[1])],
        maxTimer: 0,
        currentTimer: 0,
        phase: TurnPhase.PreTurn,
    },
    {
        code: '2222',
        isDebugMode: false,
        isStarted: true,
        isLocked: true,
        activePlayer: 0,
        players: [structuredClone(MOCK_PLAYERS[2]), structuredClone(MOCK_PLAYERS[3])],
        maxTimer: 0,
        currentTimer: 0,
        phase: TurnPhase.PreTurn,
    },
];

export const MOCK_MATCHES: Match[] = [
    {
        matchData: structuredClone(MOCK_MATCH_DATAS[0]),
        gameData: structuredClone(MOCK_GAMES[0]),
    },
    {
        matchData: structuredClone(MOCK_MATCH_DATAS[1]),
        gameData: structuredClone(MOCK_GAMES[1]),
    },
    {
        matchData: structuredClone(MOCK_MATCH_DATAS[2]),
        gameData: structuredClone(MOCK_GAMES[2]),
    },
];
