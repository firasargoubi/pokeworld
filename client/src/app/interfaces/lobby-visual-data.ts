export interface LobbyVisualData {
    players: LobbyPlayerVisualData[];
    isSelfHost: boolean;
    isDropInEnabled: boolean;
    entryFee: number;
}

export interface LobbyPlayerVisualData {
    isConnected: boolean;
    name: string;
    isHost: boolean;
    isSelf: boolean;
    avatarImage: string;
    health: number;
    id: string;
    playerType: string;
    profilePicture?: string;
}
