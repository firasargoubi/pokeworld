import { LobbyEvent } from '@common/lobby-event.enum';
import { Player } from '@common/player';
import { Inject, Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { Match } from '@common/match';
import { CODE_LENGTH, CODE_RANGE, NEW_PLAYER, MAX_PLAYERS } from './lobby.gateway.constants';

@WebSocketGateway({ cors: true })
@Injectable()
export class LobbyGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject(LobbyService) private readonly lobbyService: LobbyService;
    @Inject(MatchService) private readonly matchService: MatchService;

    @SubscribeMessage(LobbyEvent.CreateMatch)
    async createMatch(socket: Socket, gameId: string): Promise<string> {
        const matchCode = await this.lobbyService.createMatch(gameId, socket.id);

        if (matchCode) {
            socket.join(matchCode);
        }

        return matchCode;
    }

    @SubscribeMessage(LobbyEvent.JoinMatch)
    joinMatch(socket: Socket, matchCode: string): boolean {
        const hasJoinedMatch = this.lobbyService.joinMatch(matchCode, socket.id);

        if (hasJoinedMatch) {
            socket.join(matchCode);
            this.emitPlayersInMatch(matchCode);
        }

        return hasJoinedMatch;
    }

    @SubscribeMessage(LobbyEvent.LeaveMatch)
    leaveMatch(socket: Socket) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const isAdmin = this.lobbyService.isPlayerAdmin(socket.id);

        if (isAdmin) {
            const playerIds = this.lobbyService.destroyMatch(matchCode);
            playerIds.forEach((playerId) => {
                if (playerId !== socket.id) {
                    this.server.sockets.sockets.get(playerId)?.leave(matchCode);
                    this.emitPlayerRemovedFromRoom(playerId);
                }
            });
        } else {
            this.matchService.removePlayerFromMatch(socket.id, matchCode);
            this.emitPlayersInMatch(matchCode);
        }
        socket.leave(matchCode);
    }

    @SubscribeMessage(LobbyEvent.KickPlayer)
    kickPlayer(socket: Socket, targetPlayerId: string) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const isAdmin = this.lobbyService.isPlayerAdmin(socket.id);

        if (isAdmin && targetPlayerId !== socket.id) {
            this.server.sockets.sockets.get(targetPlayerId).leave(matchCode);
            this.matchService.removePlayerFromMatch(targetPlayerId, matchCode);
            this.emitPlayerRemovedFromRoom(targetPlayerId);
            this.emitPlayersInMatch(matchCode);
        }
    }

    @SubscribeMessage(LobbyEvent.UpdatePlayer)
    updatePlayer(socket: Socket, updatedFields: Partial<Player>): boolean {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const players = this.lobbyService.getPlayers(matchCode);
        const player = players.find((p) => p.id === socket.id);

        Object.assign(player, updatedFields);
        if (updatedFields.name) {
            player.name = this.lobbyService.getUniqueName(updatedFields.name, socket.id);
        }

        this.emitPlayersInMatch(matchCode);

        return true;
    }

    @SubscribeMessage(LobbyEvent.StartMatch)
    startMatch(socket: Socket) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const match = this.matchService.getMatch(matchCode);
        this.server.to(matchCode).emit(LobbyEvent.MatchStarted, match);
    }

    @SubscribeMessage(LobbyEvent.ToggleLockRoom)
    toggleLockRoom(socket: Socket, isLocked: boolean): boolean {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const players = this.lobbyService.getPlayers(matchCode);
        const player = players.find((p) => p.id === socket.id);

        if (!player.isAdmin) return false;

        this.matchService.setMatchLockState(matchCode, isLocked);

        this.server.to(matchCode).emit(LobbyEvent.RoomLockChanged, isLocked);

        return true;
    }

    // @SubscribeMessage(LobbyEvents.ToggleLockRoom)
    // toggleLockRoom(socket: Socket, shouldLock: boolean): boolean {
    //     const gameCode = this.playerToMatch.get(socket.id);
    //     if (!gameCode) return false;

    //     const match = this.matches.get(gameCode);
    //     const player = match.matchData.players.find((p) => p.id === socket.id);

    //     if (!player.isAdmin) return false;

    //     if (!shouldLock) {
    //         const connectedPlayerCount = match.matchData.players.filter((p) => p.isConnected).length;
    //         const maxPlayers = MAX_PLAYERS[match.gameData.mapData.size];

    //         if (connectedPlayerCount >= maxPlayers) {
    //             this.debug(socket, `Impossible de déverrouiller: nombre maximum de joueurs atteint (${maxPlayers})`);
    //             return false;
    //         }
    //     }

    //     match.matchData.isLocked = shouldLock;
    //     this.server.to(gameCode).emit(LobbyEvents.RoomLockChanged, shouldLock);
    //     return true;
    // }

    handleDisconnect(socket: Socket) {
        this.leaveMatch(socket);
    }

    private emitPlayersInMatch(matchCode: string): void {
        const players = this.lobbyService.getPlayers(matchCode);
        this.server.to(matchCode).emit(LobbyEvent.UpdatePlayerList, players);
    }

    private emitPlayerRemovedFromRoom(clientId: string): void {
        const socket = this.server.sockets.sockets.get(clientId);
        socket?.emit(LobbyEvent.UpdatePlayerList, []);
    }
    
    debug(socket, message: string) {
        socket.emit(LobbyEvents.Debug, message);
    }

    private updateRoomLockStatus(match: Match, gameCode: string): void {
        const maxPlayers = MAX_PLAYERS[match.gameData.mapData.size];
        const connectedPlayerCount = match.matchData.players.filter((player) => player.isConnected).length;

        if (connectedPlayerCount >= maxPlayers && !match.matchData.isLocked) {
            match.matchData.isLocked = true;
            this.server.to(gameCode).emit(LobbyEvents.RoomLockChanged, true);
        } else if (connectedPlayerCount < maxPlayers && match.matchData.isLocked) {
            match.matchData.isLocked = false;
            this.server.to(gameCode).emit(LobbyEvents.RoomLockChanged, false);
        }
    }
}
