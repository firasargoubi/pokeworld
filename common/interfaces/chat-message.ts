export interface ChatMessage {
    sender?: string;
    senderId?: string;
    profilePicture?: string | null;
    content: string;
    timestamp: Date;
}

export interface ChatLog extends ChatMessage {
    concernedPlayersNamesList: string[];
    messageParams?: Record<string, string | number | boolean>;
}
