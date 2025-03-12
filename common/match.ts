import { GameData } from './game-data';
import { Player } from './player';

export interface Match {
    matchData: MatchData;
    gameData: GameData;
}

export interface MatchData {
    activePlayer: number;
    players: Player[];
}
