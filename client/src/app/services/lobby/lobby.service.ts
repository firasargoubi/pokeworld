import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MatchData, MatchSettings, MatchState } from '@common/interfaces/match-data';
import { Avatar, PlayerData, PlayerType } from '@common/interfaces/player-data';
import { LobbyEvent } from '@common/interfaces/socket-event.enum';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    private socketService: SocketService = inject(SocketService);
    private matchService: MatchService = inject(MatchService);
    private router: Router = inject(Router);

    constructor() {
        this.matchService.matchUpdate.pipe(takeUntilDestroyed()).subscribe(this.onMatchUpdate.bind(this));
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

    addBot(botType: PlayerType) {
        this.socketService.emit(LobbyEvent.AddBot, botType);
    }

    changeMatchSettings(matchSettings: MatchSettings) {
        this.socketService.emit(LobbyEvent.ChangeMatchSettings, matchSettings);
    }

    private onMatchUpdate(oldMatchData: MatchData) {
        const oldIsConnected = oldMatchData.players.find((p) => p.id === this.socketService.selfId)?.isConnected ?? false;
        const oldState = oldMatchData.state;
        const playerJoinedInLobby = !oldIsConnected && this.matchService.selfPlayer.isConnected;
        if (this.matchService.isState([MatchState.Lobby]) && playerJoinedInLobby) {
            this.router.navigate([PageEndpoint.Lobby]);
        } else if (!this.matchService.isState([MatchState.Lobby]) && playerJoinedInLobby) {
            this.router.navigate([PageEndpoint.Play]);
        } else if (oldState === MatchState.Lobby && this.matchService.isState([MatchState.TurnStart])) {
            this.router.navigate([PageEndpoint.Play]);
        }
    }
}
