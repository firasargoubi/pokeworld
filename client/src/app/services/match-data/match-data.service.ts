import { inject, Injectable } from '@angular/core';
import { Match, MatchData } from '@common/match';
import { DEFAULT_MATCH } from './match-data.service.const';
import { GameDataService } from '@app/services/game-data/game-data.service';

@Injectable({
    providedIn: 'root',
})
export class MatchDataService {
    matchData: MatchData = DEFAULT_MATCH;
    private gameDataService: GameDataService = inject(GameDataService);

    startMatch(match: Match) {
        this.gameDataService.setGameData(match.gameData);
        this.matchData = match.matchData;
    }
}
