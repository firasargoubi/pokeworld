import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbyEvent } from '@common/lobby-event.enum';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LobbySocketsService {
    matchCode: string;
    private playersSubject: BehaviorSubject<Player[]>;
    private roomLockedSubject: BehaviorSubject<boolean>;
    private coreSocket: CoreSocketService;
    private matchDataService: MatchDataService;
    private popupService: PopupService;
    private router: Router;

    constructor() {
        this.matchCode = '';
        this.playersSubject = new BehaviorSubject<Player[]>([]);
        this.roomLockedSubject = new BehaviorSubject<boolean>(false);
        this.coreSocket = inject(CoreSocketService);
        this.matchDataService = inject(MatchDataService);
        this.router = inject(Router);
        this.popupService = inject(PopupService);
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

    async createMatch(gameId: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.coreSocket.emit(LobbyEvent.CreateMatch, gameId, (matchCode: string) => {
                this.matchCode = matchCode;
                resolve(matchCode !== '');
            });
        });
    }

    kickPlayer(playerId: string) {
        this.coreSocket.emit(LobbyEvent.KickPlayer, playerId);
    }

    joinMatch(matchCode: string): Observable<boolean> {
        return new Observable((observer) => {
            this.coreSocket.emit(LobbyEvent.JoinMatch, matchCode, (success: boolean) => {
                if (success) {
                    this.matchCode = matchCode;
                }
                observer.next(success);
            });
        });
    }

    leaveMatch(): void {
        this.popupService.showPopup('Voulez-vous vraiment quitter le lobby?', true, this.leaveMatchAction.bind(this));
    }

    updatePlayer(playerUpdates: Partial<Player>) {
        this.coreSocket.emit(LobbyEvent.UpdatePlayer, playerUpdates);
    }

    changeLockStatus(lockStatus: boolean): void {
        this.coreSocket.emit(LobbyEvent.ChangeLockStatus, lockStatus);
    }

    startMatch(): void {
        this.coreSocket.emit(LobbyEvent.StartMatch);
    }

    private leaveMatchAction(): void {
        this.coreSocket.emit(LobbyEvent.LeaveMatch);
        this.router.navigate(['/']);
    }

    private setupLobbyListeners(): void {
        this.coreSocket.on(LobbyEvent.UpdatePlayerList, this.onUpdatePlayersLists.bind(this));
        this.coreSocket.on(LobbyEvent.LockStatusChanged, this.onLockStatusChanged.bind(this));
        this.coreSocket.on(LobbyEvent.MatchStarted, this.onMatchStarted.bind(this));
        this.coreSocket.on(LobbyEvent.RemovedFromMatch, this.onRemovedFromMatch.bind(this));
    }

    private onLockStatusChanged(isLocked: boolean) {
        this.roomLockedSubject.next(isLocked);
    }

    private onUpdatePlayersLists(players: Player[]) {
        this.playersSubject.next(players);
    }

    private onRemovedFromMatch() {
        this.popupService.showPopup('Vous avez été retiré de la partie');
        this.popupService.keepMessages();
        this.router.navigate(['/']);
    }

    private onMatchStarted(match: Match) {
        this.matchDataService.startMatch(match, this.coreSocket.selfId);
        this.router.navigate(['/play']);
    }
}
