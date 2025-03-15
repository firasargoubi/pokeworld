import { inject, Injectable } from '@angular/core';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Match } from '@common/match';
import { PlayEvent } from '@common/play-event.enum';
import { ONE_SECOND } from './play-sockets.const';

@Injectable({
    providedIn: 'root',
})
export class PlaySocketsService {
    private coreSocket: CoreSocketService;
    private matchDataService: MatchDataService;
    private timerService: TimerService;
    private popupService: PopupService;

    constructor() {
        this.coreSocket = inject(CoreSocketService);
        this.matchDataService = inject(MatchDataService);
        this.timerService = inject(TimerService);
        this.popupService = inject(PopupService);
        this.setupPlayListeners();
    }

    endTurn(): void {
        this.coreSocket.emit(PlayEvent.EndTurn);
    }

    private setupPlayListeners(): void {
        this.coreSocket.on(PlayEvent.PreTurnStarted, this.onPreTurnStarted.bind(this));
        this.coreSocket.on(PlayEvent.TurnStarted, this.onTurnStarted.bind(this));
    }

    private onPreTurnStarted(match: Match) {
        this.matchDataService.updateMatch(match);
        const playerName = match.matchData.players[match.matchData.activePlayer].name;
        this.timerService.startTimer(match.matchData.maxTimer / ONE_SECOND);
        this.popupService.showPopup(`Début du tour de ${playerName}`);
    }

    private onTurnStarted(match: Match) {
        this.matchDataService.updateMatch(match);
        this.popupService.clearMessages();
        this.timerService.startTimer(match.matchData.maxTimer / ONE_SECOND);
    }
}
