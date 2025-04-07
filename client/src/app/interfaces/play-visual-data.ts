import { Team } from '@common/interfaces/player-data';

export interface PlayVisualData {
    canUseAction: boolean;
    canEndTurn: boolean;
    currentPlayerCount: number;
    players: PlayerVisualData[];
    selfAvatarUrl: string;
    movementLeft: number;
    thumbnailUrl: string;
    isInventoryFull: boolean;
}

export interface PlayerVisualData {
    id: string;
    name: string;
    avatarUrl: string;
    combatsWon: number;
    isHost: boolean;
    isBot: boolean;
    isConnected: boolean;
    team?: Team;
}
