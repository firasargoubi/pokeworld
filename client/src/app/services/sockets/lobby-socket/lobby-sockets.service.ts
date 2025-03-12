import { inject, Injectable } from '@angular/core';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbyEvent } from '@common/lobby-event.enum';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LobbySocketsService {
    private matchCode: string;
    private playersSubject: BehaviorSubject<Player[]>;
    private roomLockedSubject: BehaviorSubject<boolean>;
    private coreSocket: CoreSocketService;
    private matchDataService: MatchDataService;

    constructor() {
        this.matchCode = '';
        this.playersSubject = new BehaviorSubject<Player[]>([]);
        this.roomLockedSubject = new BehaviorSubject<boolean>(false);
        this.coreSocket = inject(CoreSocketService);
        this.matchDataService = inject(MatchDataService);
        this.setupLobbyListeners();
    }

    get matchRoomCode(): string {
        return this.matchCode;
    }

    get players$(): Observable<Player[]> {
        return this.playersSubject.asObservable();
    }

    get roomLocked$(): Observable<boolean> {
        return this.roomLockedSubject.asObservable();
    }

    set matchRoomCode(code: string) {
        this.matchCode = code;
    }

    createMatch(): void {
        this.coreSocket.emit(LobbyEvent.CreateMatch, (matchCode: string) => {
            this.matchRoomCode = matchCode;
        });
    }

    joinMatch(matchCode: string): void {
        this.coreSocket.emit(LobbyEvent.JoinMatch, matchCode, (success: boolean) => {
            window.console.log('join status : ' + success);
            if (success) {
                this.matchCode = matchCode;
            }
        });
    }

    leaveMatch(): void {
        this.coreSocket.emit(LobbyEvent.LeaveMatch, (success: boolean) => {
            window.console.log('leave status : ' + success);
            // peut etre supprimé pour l'instant necessaire pour la coherence de l'Affichage
            if (success) {
                this.matchCode = '';
                this.playersSubject.next([]);
                this.roomLockedSubject.next(false);
            }
        });
    }

    updatePlayer(playerUpdates: Partial<Player>) {
        this.coreSocket.emit(LobbyEvent.UpdatePlayer, playerUpdates, (success: boolean) => {
            window.console.log(`update status : ${success}`);
        });
    }

    toggleLockRoom(shouldLock: boolean): void {
        this.coreSocket.emit(LobbyEvent.ToggleLockRoom, shouldLock, (success: boolean) => {
            window.console.log(`toggle lock status : ${success}`);
            if (success) {
                // Optionnel: mettre à jour l'état local immédiatement pour une UI réactive
                // (bien que l'événement roomLockChanged devrait arriver rapidement du serveur)
                this.roomLockedSubject.next(shouldLock);
            }
        });
    }

    disconnect(): void {
        this.coreSocket.disconnect();
    }

    startMatch(): void {
        this.coreSocket.emit(LobbyEvent.StartMatch);
    }

    private setupLobbyListeners(): void {
        this.coreSocket.on(LobbyEvent.UpdatePlayersLists, this.onUpdatePlayersLists.bind(this));
        this.coreSocket.on(LobbyEvent.MatchDestroyed, this.onMatchDestroyed.bind(this));
        this.coreSocket.on(LobbyEvent.RoomLockChanged, this.onRoomLockChanged.bind(this));
        this.coreSocket.on(LobbyEvent.MatchStarted, this.onMatchStarted.bind(this));
    }

    private onRoomLockChanged(isLocked: boolean) {
        this.roomLockedSubject.next(isLocked);
    }

    private onMatchDestroyed() {
        // TODO TEMP Rediriger l'utilisateur ou afficher un message
        this.playersSubject.next([]);
    }

    private onUpdatePlayersLists(players: Player[]) {
        // TODO TEMP Update the subject so all subscribers are notified
        this.playersSubject.next(players);
    }

    private onMatchStarted(match: Match) {
        this.matchDataService.startMatch(match);
    }
}
