export interface MatchVisualData {
    backgroundUrl: string;
    currentTimer: number;
    maxTimer: number;
    currentPlayerTurn: number;
    isCTF: boolean;
    players: PlayerVisualData[];
}

export interface PlayerVisualData {
    name: string;
    avatarUrl: string;
    fightsWon: number;
    isAdmin: boolean;
    isBot: boolean;
    hasLeft: boolean;
    hasFlag: boolean;
}
