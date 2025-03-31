import { inject, Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer/timer';
import { SocketService } from '@app/services/socket/socket.service';
import { COMBAT_TURN_DURATION } from '@common/consts/combat-data.const';
import { CombatEvent } from '@common/interfaces/socket-event.enum';
import { MatchService } from '@app/services/match/match.service';
import { MatchData, MatchState } from '@common/interfaces/match-data';

@Injectable({
    providedIn: 'root',
})
export class CombatService {
    timer: Timer = new Timer(COMBAT_TURN_DURATION);
    private matchService: MatchService = inject(MatchService);
    private socketService: SocketService = inject(SocketService);

    constructor() {
        this.timer.restartTimer(this.matchService.data.combatData.turnDuration);
        this.matchService.matchUpdate.subscribe(this.onMatchUpdate.bind(this));
    }

    escape(): void {
        this.socketService.emit(CombatEvent.Escape);
    }

    attack(): void {
        this.socketService.emit(CombatEvent.Attack);
    }

    private onMatchUpdate(oldMatchData: MatchData) {
        if (oldMatchData.state !== MatchState.CombatWait && this.matchService.isState([MatchState.CombatWait])) {
            this.timer.restartTimer(this.matchService.data.combatData.turnDuration);
        }
    }
}
