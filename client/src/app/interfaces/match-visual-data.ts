export interface MatchVisualData {
    backgroundUrl: string;
    currentTimer: number;
    maxTimer: number;
    currentPlayerTurn: number;
    players: PlayerVisualData[];
}

export interface PlayerVisualData {
    avatarUrl: string;
    name: string;
    isAdmin: boolean;
}
