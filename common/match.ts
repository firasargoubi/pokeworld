import { ChatMessage } from './chat-message';
import { GameData } from './game-data';
import { Player } from './player';

export interface Match {
    matchData: MatchData;
    gameData: GameData;
}

export interface MatchData {
    gameCode: string;
    players: Player[];
    chatHistory: ChatMessage;
    timer: number;
}
