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
    private coreSocket: CoreSocketService = inject(CoreSocketService);

    constructor() {
        this.setupLobbyListeners();
    }

    get matchRoomCode(): string {
        return this.matchCode;
    }

    // Expose players as an observable
    get players$(): Observable<Player[]> {
        return this.playersSubject.asObservable();
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
            }
        });
    }

    updatePlayer(playerUpdates: Partial<Player>) {
        this.coreSocket.emit(LobbyEvents.UpdatePlayer, playerUpdates, (success: boolean) => {
            window.console.log(`update status : ${success}`);
        });
    }

    disconnect(): void {
        this.coreSocket.disconnect();
    }
}
