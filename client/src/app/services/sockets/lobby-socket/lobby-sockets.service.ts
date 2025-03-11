import { inject, Injectable } from '@angular/core';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbyEvents } from '@common/lobby-events.enum';
import { Player } from '@common/player';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LobbySocketsService {
    private matchCode: string;
    private playersSubject: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
    private roomLockedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private coreSocket: CoreSocketService = inject(CoreSocketService);

    constructor() {
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

    setupLobbyListeners(): void {
        this.coreSocket.on(LobbyEvents.UpdatePlayersLists, (players: Player[]) => {
            // Update the subject so all subscribers are notified
            this.playersSubject.next(players);
        });
        this.coreSocket.on(LobbyEvents.GameDestroyed, () => {
            this.playersSubject.next([]);
            // Rediriger l'utilisateur ou afficher un message
        });

        this.coreSocket.on(LobbyEvents.RoomLockChanged, (isLocked: boolean) => {
            this.roomLockedSubject.next(isLocked);
        });
    }

    createGame(): void {
        this.coreSocket.emit(LobbyEvents.CreateGame, (gameCode: string) => {
            this.matchRoomCode = gameCode;
        });
    }

    joinGame(gameCode: string): void {
        this.coreSocket.emit(LobbyEvents.JoinGame, gameCode, (success: boolean) => {
            window.console.log('join status : ' + success);
            if (success) {
                this.matchCode = gameCode;
            }
        });
    }

    leaveGame(): void {
        this.coreSocket.emit(LobbyEvents.LeaveGame, (success: boolean) => {
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
        this.coreSocket.emit(LobbyEvents.UpdatePlayer, playerUpdates, (success: boolean) => {
            window.console.log(`update status : ${success}`);
        });
    }

    toggleLockRoom(shouldLock: boolean): void {
        this.coreSocket.emit(LobbyEvents.ToggleLockRoom, shouldLock, (success: boolean) => {
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
}
