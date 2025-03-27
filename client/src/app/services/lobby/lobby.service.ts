import { inject, Injectable } from '@angular/core';
import { LobbyEvent } from '@common/interfaces/socket-event.enum';
import { Avatar, PlayerData } from '@common/interfaces/player-data';
import { SocketService } from '@app/services/socket/socket.service';
import { MatchService } from '@app/services/match/match.service';
import { Router } from '@angular/router';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MatchState } from '@common/interfaces/match-data';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    private oldState: MatchState = MatchState.Lobby;
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
        if (this.matchService.isState(MatchState.Lobby) && !this.oldIsConnected && this.matchService.selfPlayer.isConnected) {
            this.router.navigate([PageEndpoint.Lobby]);
        } else if (this.oldState === MatchState.Lobby && this.matchService.isState(MatchState.TurnStart)) {
            this.router.navigate([PageEndpoint.Play]);
        }
        this.oldIsConnected = this.matchService.selfPlayer.isConnected;
        this.oldState = this.matchService.data.state;
    }
}
