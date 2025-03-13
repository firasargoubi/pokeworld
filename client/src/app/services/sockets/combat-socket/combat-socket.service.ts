import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { CombatEvents } from '@common/combat-events.enum';
import { AttackResult, CombatData, CombatResult } from '@common/combat-interfaces';
import { LobbyEvents } from '@common/lobby-events.enum';
import { Player } from '@common/player';
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

    private combatRoomCode: string;

    private selfPlayerSubject: BehaviorSubject<Player | null> = new BehaviorSubject<Player | null>(null);
    private ennemyPlayerSubject: BehaviorSubject<Player | null> = new BehaviorSubject<Player | null>(null);

    private coreSocket: CoreSocketService = inject(CoreSocketService);
    private router: Router = inject(Router);

    constructor() {
        this.combatResult.next(null);
        this.setupCombatListeners();
        this.setupTurnListeners();
        this.setupPlayerUpdateListener();
    }

    get selfPlayer$(): Observable<Player | null> {
        return this.selfPlayerSubject.asObservable();
    }

    get ennemyPlayer$(): Observable<Player | null> {
        return this.ennemyPlayerSubject.asObservable();
    }

    initFight(targetPlayerId: string): void {
        this.coreSocket.emit(LobbyEvents.StartCombat, targetPlayerId);
    }

    escapeAttempt(): void {
        this.coreSocket.emit(CombatEvents.EscapeAttempt, {
            combatRoomCode: this.combatRoomCode,
            playerId: this.selfPlayerSubject.value?.id,
        });
    }

    attackAttempt(): void {
        this.coreSocket.emit(CombatEvents.AttackAttempt, {
            combatRoomCode: this.combatRoomCode,
            targetId: this.ennemyPlayerSubject.value?.id,
        });
    }

    private setupCombatListeners(): void {
        this.coreSocket.on(LobbyEvents.CombatStarted, (combatData: CombatData) => {
            const playerOne: Player = combatData.players[0];
            const playerTwo: Player = combatData.players[1];

            const isSelfPlayerOne = playerOne.id === this.coreSocket.selfId;
            const selfPlayer = isSelfPlayerOne ? playerOne : playerTwo;
            const ennemyPlayer = isSelfPlayerOne ? playerTwo : playerOne;
            this.combatRoomCode = combatData.combatRoomCode;

            this.selfPlayerSubject.next(selfPlayer);
            this.ennemyPlayerSubject.next(ennemyPlayer);
            this.router.navigate(['/combat']);
        });

        this.coreSocket.on(CombatEvents.EscapedResult, (playerId: string) => {
            this.escapeResult.next(playerId);
        });

        this.coreSocket.on(CombatEvents.AttackResult, (attackResult: AttackResult) => {
            this.attackResult.next(attackResult);
        });

        this.coreSocket.on(CombatEvents.EndCombat, (result: CombatResult) => {
            // popup instead
            window.console.log(`Combat terminé, ganant: ${result.winnerId}`);
            this.combatResult.next(result);

            const navigationDelay = 1200;
            setTimeout(() => {
                // TODO: Should be play page (also change test)
                this.router.navigate(['/join']);
            }, navigationDelay);
        });
    }

    private setupTurnListeners(): void {
        this.coreSocket.on(CombatEvents.CombatTurnStarted, () => {
            this.currentTurn.next(true);
        });
        this.coreSocket.on(CombatEvents.CombatTurnStopped, () => {
            this.currentTurn.next(false);
        });
        this.coreSocket.on(CombatEvents.StartTimer, (time: number) => {
            this.currentTimer.next(time);
        });
    }

    private setupPlayerUpdateListener(): void {
        this.coreSocket.on(CombatEvents.UpdatePlayers, ([playerOne, playerTwo]: Player[]) => {
            const isSelfPlayerOne = playerOne.id === this.coreSocket.selfId;
            this.selfPlayerSubject.next(isSelfPlayerOne ? playerOne : playerTwo);
            this.ennemyPlayerSubject.next(isSelfPlayerOne ? playerTwo : playerOne);
        });
    }
}
