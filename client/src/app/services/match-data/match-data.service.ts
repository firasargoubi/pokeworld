import { inject, Injectable } from '@angular/core';
import { DEFAULT_GAME } from '@app/consts/default-game.const';
import { MapService } from '@app/services/map/map.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { Match, MatchData } from '@common/match';
import { Position } from '@common/position';
import { Subject } from 'rxjs';
import { DEFAULT_MATCH } from './match-data.service.const';

@Injectable({
    providedIn: 'root',
})
export class MatchDataService {
    selfIndex: number = 0;
    matchUpdate: Subject<null> = new Subject();
    matchData: MatchData = structuredClone(DEFAULT_MATCH);
    private gameDataService: GameDataService = inject(GameDataService);
    private mapService: MapService = inject(MapService);

    startMatch(match: Match, socketId: string) {
        this.updateMatch(match);
        this.selfIndex = match.matchData.players.findIndex((player) => player.id === socketId);
        this.mapService.setPlayers(match.matchData.players);
    }

    resetMatch() {
        this.updateMatch({
            matchData: structuredClone(DEFAULT_MATCH),
            gameData: structuredClone(DEFAULT_GAME),
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
