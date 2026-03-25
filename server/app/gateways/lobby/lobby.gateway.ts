import { LobbyService } from '@app/services/lobby/lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
import { MatchSettings } from '@common/interfaces/match-data';
import { Avatar, PlayerData, PlayerType } from '@common/interfaces/player-data';
import { LobbyEvent } from '@common/interfaces/socket-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class LobbyGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;
    @Inject(forwardRef(() => LobbyService)) private readonly lobbyService: LobbyService;
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService;

    @SubscribeMessage(LobbyEvent.KickPlayer)
    kickPlayer(socket: Socket, targetPlayerId: string) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.lobbyService.kickPlayer(match, playerId, targetPlayerId);
        }
    }

    @SubscribeMessage(LobbyEvent.ChangeAvatar)
    changeAvatar(socket: Socket, avatar: Avatar) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.lobbyService.changeAvatar(match, playerId, avatar);
        }
    }

    @SubscribeMessage(LobbyEvent.JoinLobby)
    joinLobby(socket: Socket, playerData: PlayerData) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.lobbyService.joinLobby(match, playerId, playerData);
        }
    }

    @SubscribeMessage(LobbyEvent.ChangeLockStatus)
    changeLockStatus(socket: Socket, lockStatus: boolean) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.lobbyService.changeLockStatus(match, playerId, lockStatus);
        }
    }

    @SubscribeMessage(LobbyEvent.ChangeMatchSettings)
    changeMatchSettings(socket: Socket, matchSettings: MatchSettings) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.lobbyService.changeMatchSettings(match, playerId, matchSettings);
        }
    }

    @SubscribeMessage(LobbyEvent.StartMatch)
    startMatch(socket: Socket) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.lobbyService.startMatch(match, playerId);
        }
    }

    @SubscribeMessage(LobbyEvent.AddBot)
    addBot(socket: Socket, botType: PlayerType) {
        const playerId = this.userService.resolvePlayerId(socket);
        const match = this.matchService.getMatchFromPlayerId(playerId);
        if (match) {
            this.lobbyService.addBot(match, botType);
        }
    }
}
