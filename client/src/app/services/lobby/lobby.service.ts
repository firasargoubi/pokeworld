import { inject, Injectable } from '@angular/core';
import { LobbyEvent } from '@common/interfaces/socket-event.enum';
import { Avatar, PlayerData } from '@common/interfaces/player-data';
import { SocketService } from '@app/services/socket/socket.service';
import { MatchService } from '@app/services/match/match.service';
import { Router } from '@angular/router';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    private oldIsConnected: boolean = false;
    private socketService: SocketService = inject(SocketService);
    private matchService: MatchService = inject(MatchService);
    private router: Router = inject(Router);

    constructor() {
        this.matchService.matchUpdate.subscribe(this.onMatchUpdate.bind(this));
    }

    kickPlayer(playerId: string) {
        this.socketService.emit(LobbyEvent.KickPlayer, playerId);
    }

    changeAvatar(avatar: Avatar) {
        this.socketService.emit(LobbyEvent.ChangeAvatar, avatar);
    }

    joinLobby(playerData: PlayerData) {
        this.socketService.emit(LobbyEvent.JoinLobby, playerData);
    }

    changeLockStatus(lockStatus: boolean) {
        this.socketService.emit(LobbyEvent.ChangeLockStatus, lockStatus);
    }

    startMatch() {
        this.socketService.emit(LobbyEvent.StartMatch);
    }

    private onMatchUpdate() {
        if (!this.oldIsConnected && this.matchService.selfPlayer.isConnected) {
            this.router.navigate([PageEndpoint.Lobby]);
        }
        this.oldIsConnected = this.matchService.selfPlayer.isConnected;
    }

    // joinMatch(matchCode: string): Observable<boolean> {
    //     return new Observable((observer) => {
    //         this.coreSocket.emit(LobbyEvent.JoinMatch, matchCode, (success: boolean) => {
    //             if (success) {
    //                 this.matchCode = matchCode;
    //             }
    //             observer.next(success);
    //         });
    //     });
    // }

    // updatePlayer(playerUpdates: Partial<Player>) {
    //     this.coreSocket.emit(LobbyEvent.UpdatePlayer, playerUpdates);
    // }

    // changeLockStatus(lockStatus: boolean): void {
    //     this.coreSocket.emit(LobbyEvent.ChangeLockStatus, lockStatus);
    // }

    // startMatch(): void {
    //     this.coreSocket.emit(LobbyEvent.StartMatch);
    // }

    // leaveMatch(): void {
    //     this.coreSocket.emit(LobbyEvent.LeaveMatch);
    //     this.matchCode = '';
    //     this.router.navigate([PageEndpoint.Menu]);
    // }

    // private setupLobbyListeners(): void {
    //     this.coreSocket.on(LobbyEvent.UpdatePlayerList, this.onUpdatePlayersLists.bind(this));
    //     this.coreSocket.on(LobbyEvent.LockStatusChanged, this.onLockStatusChanged.bind(this));
    //     this.coreSocket.on(LobbyEvent.MatchStarted, this.onMatchStarted.bind(this));
    //     this.coreSocket.on(LobbyEvent.Warning, this.onWarning.bind(this));
    //     this.coreSocket.on(LobbyEvent.EmitGameData, this.onEmitGameData.bind(this));
    // }

    // private onLockStatusChanged(isLocked: boolean) {
    //     this.roomLockedSubject.next(isLocked);
    // }

    // private onUpdatePlayersLists(players: Player[]) {
    //     this.playersSubject.next(players);
    // }

    // private onMatchStarted(match: Match) {
    //     this.matchDataService.startMatch(match, this.coreSocket.selfId);
    //     this.router.navigate([PageEndpoint.Play]);
    // }

    // private onWarning(warning: Warning) {
    //     this.popupService.clearMessages();
    //     if (warning === Warning.LockedFromLobby) {
    //         this.popupService.showPopup(warning, true, () => {
    //             this.router.navigate([PageEndpoint.Menu]);
    //         });
    //         this.popupService.keepMessages();
    //         this.router.navigate([PageEndpoint.Join]);
    //     } else {
    //         this.popupService.showPopup(warning);
    //         if ([Warning.Kick, Warning.AdminQuit, Warning.LastPlayerRemaining].includes(warning)) {
    //             this.popupService.keepMessages();
    //             this.router.navigate([PageEndpoint.Menu]);
    //         }
    //     }
    // }

    // private onEmitGameData(gameData: GameData) {
    //     this.gameDataService.gameData = gameData;
    // }
}
