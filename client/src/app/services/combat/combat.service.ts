import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Timer } from '@app/classes/timer/timer';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { COMBAT_TURN_DURATION } from '@common/consts/combat-data.const';
import { CombatAction, CombatData, MatchData, MatchState } from '@common/interfaces/match-data';
import { CombatEvent } from '@common/interfaces/socket-event.enum';

@Injectable({
    providedIn: 'root',
})
export class CombatService {
    timer: Timer = new Timer(COMBAT_TURN_DURATION);
    private matchService: MatchService = inject(MatchService);
    private socketService: SocketService = inject(SocketService);
    private lastCombatData: CombatData;

    constructor() {
        this.timer.restartTimer(this.matchService.data.combatData.turnDuration);
        this.lastCombatData = structuredClone(this.matchService.data.combatData);
        this.matchService.matchUpdate.pipe(takeUntilDestroyed()).subscribe(this.onMatchUpdate.bind(this));
    }

    escape() {
        this.socketService.emit(CombatEvent.Escape);
    }

    attack() {
        this.socketService.emit(CombatEvent.Attack);
    }

    hasPlayerHealed(playerIndex: number): boolean {
        const previousPlayerData = this.lastCombatData.playersCombatData.find((data) => data.playerIndex === playerIndex);
        const currentPlayerData = this.matchService.data.combatData.playersCombatData.find((data) => data.playerIndex === playerIndex);
        const isCombatStart = this.matchService.data.combatData.lastCombatAction === CombatAction.None;
        if (!previousPlayerData || !currentPlayerData || isCombatStart) {
            return false;
        }

        return currentPlayerData.currentHealth > previousPlayerData.currentHealth;
    }

    private onMatchUpdate(oldMatchData: MatchData) {
        if (oldMatchData.state !== MatchState.CombatWait && this.matchService.isState([MatchState.CombatWait])) {
            this.lastCombatData = { ...oldMatchData.combatData };
            this.timer.restartTimer(this.matchService.data.combatData.turnDuration);
        }
    }
}
