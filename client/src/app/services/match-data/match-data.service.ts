import { inject, Injectable } from '@angular/core';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { Match, MatchData } from '@common/match';
import { MapService } from '../map/map.service';
import { DEFAULT_MATCH } from './match-data.service.const';

@Injectable({
    providedIn: 'root',
})
export class MatchDataService {
    selfIndex: number = 0;
    matchData: MatchData = DEFAULT_MATCH;
    private gameDataService: GameDataService = inject(GameDataService);
    private mapService: MapService = inject(MapService);

    startMatch(match: Match, socketId: string) {
        this.updateMatch(match);
        this.selfIndex = match.matchData.players.findIndex((player) => player.id === socketId);
        this.mapService.setPlayers(match.matchData.players);
    }

    updateMatch(match: Match) {
        this.gameDataService.setGameData(match.gameData);
        this.matchData = match.matchData;
    }
}
