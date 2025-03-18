import { inject, Injectable } from '@angular/core';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { Match, MatchData } from '@common/interfaces/match';
import { Subject } from 'rxjs';
import { DEFAULT_MATCH_DATA } from '@common/consts/match.const';
import { DEFAULT_GAME_DATA } from '@app/consts/game-data.const';
import { Position } from '@common/interfaces/position';

@Injectable({
    providedIn: 'root',
})
export class MatchDataService {
    selfIndex: number = 0;
    matchUpdate: Subject<null> = new Subject();
    matchData: MatchData = structuredClone(DEFAULT_MATCH_DATA);
    private gameDataService: GameDataService = inject(GameDataService);
    private mapService: MapService = inject(MapService);

    startMatch(match: Match, socketId: string) {
        this.updateMatch(match);
        this.selfIndex = match.matchData.players.findIndex((player) => player.id === socketId);
        this.mapService.setPlayers(match.matchData.players);
    }

    resetMatch() {
        this.updateMatch({
            matchData: structuredClone(DEFAULT_MATCH_DATA),
            gameData: structuredClone(DEFAULT_GAME_DATA),
        });
    }

    updateMatch(match: Match) {
        this.gameDataService.setGameData(match.gameData);
        this.matchData = match.matchData;
        this.matchUpdate.next(null);
    }

    isActivePlayer(): boolean {
        return this.selfIndex === this.matchData.activePlayer;
    }

    getPlayerPosition(): Position {
        return this.matchData.players[this.selfIndex].currentStats.position;
    }
}
