import { LobbyEvent } from '@common/lobby-event.enum';
import { Player } from '@common/player';
import { Inject, Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from '@app/services/lobby/lobby.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class LobbyGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject(LobbyService) private readonly lobbyService: LobbyService;

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
        const matchCode = this.lobbyService.getMatchCodeFromPlayerId(socket.id);
        const isAdmin = this.lobbyService.isPlayerAdmin(socket.id);

        if (isAdmin) {
            const playerIds = this.lobbyService.deleteMatch(matchCode);
            playerIds.forEach((playerId) => {
                if (playerId !== socket.id) {
                    this.server.sockets.sockets.get(playerId)?.leave(matchCode);
                    this.emitPlayerRemovedFromRoom(playerId);
                }
            });
        } else {
            this.lobbyService.removePlayerFromMatch(socket.id, matchCode);
            this.emitPlayersInMatch(matchCode);
        }
        socket.leave(matchCode);
    }

    @SubscribeMessage(LobbyEvent.KickPlayer)
    kickPlayer(socket: Socket, targetPlayerId: string) {
        const matchCode = this.lobbyService.getMatchCodeFromPlayerId(socket.id);
        const isAdmin = this.lobbyService.isPlayerAdmin(socket.id);

        if (isAdmin && targetPlayerId !== socket.id) {
            this.server.sockets.sockets.get(targetPlayerId).leave(matchCode);
            this.lobbyService.removePlayerFromMatch(targetPlayerId, matchCode);
            this.emitPlayerRemovedFromRoom(targetPlayerId);
            this.emitPlayersInMatch(matchCode);
        }
    }

    @SubscribeMessage(LobbyEvent.UpdatePlayer)
    updatePlayer(socket: Socket, updatedFields: Partial<Player>): boolean {
        const matchCode = this.lobbyService.getMatchCodeFromPlayerId(socket.id);
        const players = this.lobbyService.getPlayers(matchCode);
        const player = players.find((p) => p.id === socket.id);

        Object.assign(player, updatedFields);
        if (updatedFields.name) {
            player.name = this.lobbyService.getUniqueName(updatedFields.name, socket.id);
        }

        this.emitPlayersInMatch(matchCode);

        return true;
    }

    @SubscribeMessage(LobbyEvent.ToggleLockRoom)
    toggleLockRoom(socket: Socket, isLocked: boolean): boolean {
        const matchCode = this.lobbyService.getMatchCodeFromPlayerId(socket.id);
        const players = this.lobbyService.getPlayers(matchCode);
        const player = players.find((p) => p.id === socket.id);

        if (!player.isAdmin) return false;

        this.lobbyService.setMatchLockState(matchCode, isLocked);

        this.server.to(matchCode).emit(LobbyEvent.RoomLockChanged, isLocked);

        return true;
    }

    @SubscribeMessage(LobbyEvent.StartMatch)
    startMatch(socket: Socket) {
        const matchCode = this.lobbyService.getMatchCodeFromPlayerId(socket.id);
        const match = this.lobbyService.getMatch(matchCode);
        this.server.to(matchCode).emit(LobbyEvent.MatchStarted, match);
    }

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
}
