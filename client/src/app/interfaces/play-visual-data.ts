export interface PlayVisualData {
    canUseAction: boolean;
    canEndTurn: boolean;
    currentPlayerCount: number;
    players: PlayerVisualData[];
    selfAvatarUrl: string;
    movementLeft: number;
    thumbnailUrl: string;
}

export interface PlayerVisualData {
    id: string;
    name: string;
    avatarUrl: string;
    fightsWon: number;
    isHost: boolean;
    isBot: boolean;
    isConnected: boolean;
}
