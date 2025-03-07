import { GameMode } from '@common/game-mode.enum';
import { MapSize } from '@common/map-size.enum';

export interface MatchVisualData {
    mapSize: MapSize;
    gameMode: GameMode;
    selfIndex: number;
    currentPlayerCount: number;
    maxPlayerCount: number;
    currentMovement: number;
    maxMovement: number;
    backgroundUrl: string;
    itemsUrl: string[];
    currentPlayerTurn: number;
    players: PlayerVisualData[];
}

export interface PlayerVisualData {
    name: string;
    avatarUrl: string;
    fightsWon: number;
    isAdmin: boolean;
    isBot: boolean;
    hasLeft: boolean;
}
