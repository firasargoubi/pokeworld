export interface PlayVisualData {
    mapSize: string;
    gameMode: string;
    canUseAction: boolean;
    canEndTurn: boolean;
    selfIndex: number;
    currentPlayerCount: number;
    maxPlayerCount: number;
    activePlayer: number;
    players: PlayerVisualData[];
    selfAvatarUrl: string;
    selfName: string;
    currentMovement: number;
    maxMovement: number;
    thumbnailUrl: string;
}

export interface PlayerVisualData {
    id: string;
    name: string;
    avatarUrl: string;
    fightsWon: number;
    isAdmin: boolean;
    isBot: boolean;
    isConnected: boolean;
}
