import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { AttackAttempt, AttackResult, CombatData, CombatResult, EscapeAttempt } from '@common/interfaces/combat';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { Player } from '@common/interfaces/player';
import { CombatEvent } from '@common/interfaces/socket-event.enum';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CombatSocketService {
    currentTurn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    currentTimer: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    attackResult: BehaviorSubject<AttackResult | null> = new BehaviorSubject<AttackResult | null>(null);
    escapeResult: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    combatResult: BehaviorSubject<CombatResult | null> = new BehaviorSubject<CombatResult | null>(null);
    private combatRoomCode: string = '';
    private selfPlayerSubject: BehaviorSubject<Player | null> = new BehaviorSubject<Player | null>(null);
    private ennemyPlayerSubject: BehaviorSubject<Player | null> = new BehaviorSubject<Player | null>(null);
    private coreSocket: CoreSocketService = inject(CoreSocketService);
    private router: Router = inject(Router);
    private popupService: PopupService = inject(PopupService);

    constructor() {
        this.setupCombatListeners();
    }

    get selfPlayer$(): Observable<Player | null> {
        return this.selfPlayerSubject.asObservable();
    }

    get ennemyPlayer$(): Observable<Player | null> {
        return this.ennemyPlayerSubject.asObservable();
    }

    escapeAttempt(): void {
        const escapeAttempt: EscapeAttempt = {
            combatRoomCode: this.combatRoomCode,
            playerId: this.selfPlayerSubject.value?.id,
        };
        this.coreSocket.emit(CombatEvent.EscapeAttempt, escapeAttempt);
    }

    attackAttempt(): void {
        const attackAttempt: AttackAttempt = {
            combatRoomCode: this.combatRoomCode,
            targetId: this.ennemyPlayerSubject.value?.id,
        };
        this.coreSocket.emit(CombatEvent.AttackAttempt, attackAttempt);
    }

    startCombat(combatData: CombatData) {
        const playerOne: Player = combatData.players[0];
        const playerTwo: Player = combatData.players[1];

        const isSelfPlayerOne = playerOne.id === this.coreSocket.selfId;
        const selfPlayer = isSelfPlayerOne ? playerOne : playerTwo;
        const ennemyPlayer = isSelfPlayerOne ? playerTwo : playerOne;
        this.combatRoomCode = combatData.combatRoomCode;

        this.selfPlayerSubject.next(selfPlayer);
        this.ennemyPlayerSubject.next(ennemyPlayer);
        this.router.navigate([PageEndpoint.Combat]);
    }

    private setupCombatListeners(): void {
        this.coreSocket.on(CombatEvent.EscapedResult, this.onEscapedResult.bind(this));
        this.coreSocket.on(CombatEvent.AttackResult, this.onAttackResult.bind(this));
        this.coreSocket.on(CombatEvent.EndCombat, this.onEndCombat.bind(this));
        this.coreSocket.on(CombatEvent.CombatTurnStarted, this.onCombatTurnStarted.bind(this));
        this.coreSocket.on(CombatEvent.CombatTurnStopped, this.onCombatTurnStopped.bind(this));
        this.coreSocket.on(CombatEvent.StartTimer, this.onStartTimer.bind(this));
        this.coreSocket.on(CombatEvent.UpdatePlayers, this.onUpdatePlayers.bind(this));
    }

    private onCombatTurnStarted() {
        this.currentTurn.next(true);
    }

    private onCombatTurnStopped() {
        this.currentTurn.next(false);
    }

    private onStartTimer(time: number) {
        this.currentTimer.next(time);
    }

    private onUpdatePlayers([playerOne, playerTwo]: Player[]) {
        const isSelfPlayerOne = playerOne.id === this.coreSocket.selfId;
        this.selfPlayerSubject.next(isSelfPlayerOne ? playerOne : playerTwo);
        this.ennemyPlayerSubject.next(isSelfPlayerOne ? playerTwo : playerOne);
    }

    private onEscapedResult(playerId: string) {
        this.escapeResult.next(playerId);
    }

    private onAttackResult(attackResult: AttackResult) {
        this.attackResult.next(attackResult);
    }

    private onEndCombat(winner: Player) {
        this.popupService.keepMessages();
        this.router.navigate([PageEndpoint.Play]);
        if (winner) {
            this.popupService.showPopup(`${winner.name} a gagné le combat`);
        } else {
            this.popupService.showPopup("Personne n'a gagné le combat");
        }
    }
}
