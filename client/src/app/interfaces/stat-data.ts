import { PlayerStatType } from './stat-type.enum';

export interface GlobalStatData {
    gameDuration: number;
    toggledBridgesRatio: number;
    visitedTilesRatio: number;
    rounds: number;
    flagHoldersCount: number;
}

export interface PlayerStatData {
    id: string;
    name: string;
    [PlayerStatType.DiscoveredItemsCount]: number;
    [PlayerStatType.VisitedTilesRatio]: number;
    [PlayerStatType.Combats]: number;
    [PlayerStatType.Victories]: number;
    [PlayerStatType.Defeats]: number;
    [PlayerStatType.Escapes]: number;
    [PlayerStatType.HpInflicted]: number;
    [PlayerStatType.HpLost]: number;
}

export interface WinnerVisualData {
    name: string;
    avatarImage: string;
    tileImage: string;
}

export interface TotalTiles {
    ground: number;
    bridge: number;
}

export enum Order {
    ASCENDING = '↑',
    DESCENDING = '↓',
}
