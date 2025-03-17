import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { GameData } from '@common/game-data';
import { LobbyEvent } from '@common/lobby-event.enum';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { Warning } from '@common/warning.enum';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LobbySocketsService {
    matchCode: string = '';
    private gameDataService: GameDataService = inject(GameDataService);
    private playersSubject: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
    private roomLockedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private coreSocket: CoreSocketService = inject(CoreSocketService);
    private matchDataService: MatchDataService = inject(MatchDataService);
    private popupService: PopupService = inject(PopupService);
    private router: Router = inject(Router);

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

    async createMatch(gameData: GameData): Promise<boolean> {
        return new Promise((resolve) => {
            this.coreSocket.emit(LobbyEvent.CreateMatch, gameData, (matchCode: string) => {
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

    updatePlayer(playerUpdates: Partial<Player>) {
        this.coreSocket.emit(LobbyEvent.UpdatePlayer, playerUpdates);
    }

    changeLockStatus(lockStatus: boolean): void {
        this.coreSocket.emit(LobbyEvent.ChangeLockStatus, lockStatus);
    }

    startMatch(): void {
        this.coreSocket.emit(LobbyEvent.StartMatch);
    }

    leaveMatch(): void {
        this.coreSocket.emit(LobbyEvent.LeaveMatch);
        this.matchCode = '';
        this.router.navigate(['/']);
    }

    private setupLobbyListeners(): void {
        this.coreSocket.on(LobbyEvent.UpdatePlayerList, this.onUpdatePlayersLists.bind(this));
        this.coreSocket.on(LobbyEvent.LockStatusChanged, this.onLockStatusChanged.bind(this));
        this.coreSocket.on(LobbyEvent.MatchStarted, this.onMatchStarted.bind(this));
        this.coreSocket.on(LobbyEvent.Warning, this.onWarning.bind(this));
        this.coreSocket.on(LobbyEvent.EmitGameData, this.onEmitGameData.bind(this));
    }

    private onLockStatusChanged(isLocked: boolean) {
        this.roomLockedSubject.next(isLocked);
    }

    private onUpdatePlayersLists(players: Player[]) {
        this.playersSubject.next(players);
    }

    private onMatchStarted(match: Match) {
        this.matchDataService.startMatch(match, this.coreSocket.selfId);
        this.router.navigate(['/play']);
    }

    private onWarning(warning: Warning) {
        this.popupService.clearMessages();
        if (warning === Warning.LockedFromLobby) {
            this.popupService.showPopup(warning, true, () => {
                this.router.navigate(['/']);
            });
            this.router.navigate(['/join']);
            this.popupService.keepMessages();
        } else {
            this.popupService.showPopup(warning);
            if ([Warning.Kick, Warning.AdminQuit, Warning.LastPlayerRemaining].includes(warning)) {
                this.router.navigate(['/']);
                this.popupService.keepMessages();
            }
        }
    }

    private onEmitGameData(gameData: GameData) {
        this.gameDataService.gameData = gameData;
    }
}
