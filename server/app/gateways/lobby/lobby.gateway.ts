import { LobbyEvent } from '@common/lobby-event.enum';
import { Player } from '@common/player';
import { Inject, Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchService } from '@app/services/match/match.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class LobbyGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject(MatchService) private readonly matchService: MatchService;

    @SubscribeMessage(LobbyEvent.CreateMatch)
    async createMatch(socket: Socket, gameId: string): Promise<string> {
        const matchCode = await this.matchService.createMatch(gameId, socket.id);

        if (matchCode) {
            socket.join(matchCode);
        }

        return matchCode;
    }

    @SubscribeMessage(LobbyEvent.JoinMatch)
    joinMatch(socket: Socket, matchCode: string): boolean {
        const hasJoined = this.matchService.joinMatch(matchCode, socket.id);

        if (hasJoined) {
            socket.join(matchCode);
            this.emitUpdatePlayerList(matchCode);
            this.emitLockStatusChanged(matchCode);
        }

        return hasJoined;
    }

    @SubscribeMessage(LobbyEvent.LeaveMatch)
    leaveMatch(socket: Socket) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        if (matchCode) {
            const isAdmin = this.matchService.isPlayerAdmin(socket.id);

            if (isAdmin) {
                const playerIds = this.matchService.destroyMatch(matchCode);
                playerIds.forEach((playerId) => {
                    if (playerId !== socket.id) {
                        this.server.sockets.sockets.get(playerId)?.leave(matchCode);
                        this.emitRemovedFromMatch(playerId);
                    }
                });
            } else {
                this.matchService.removePlayerFromMatch(socket.id, matchCode);
                this.emitUpdatePlayerList(matchCode);
                this.emitLockStatusChanged(matchCode);
            }
            socket.leave(matchCode);
        }
    }

    @SubscribeMessage(LobbyEvent.KickPlayer)
    kickPlayer(socket: Socket, targetPlayerId: string) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const isAdmin = this.matchService.isPlayerAdmin(socket.id);
        const isTryingToKickThemselve = targetPlayerId === socket.id;

        if (isAdmin && !isTryingToKickThemselve) {
            this.server.sockets.sockets.get(targetPlayerId).leave(matchCode);
            this.matchService.removePlayerFromMatch(targetPlayerId, matchCode);
            this.emitRemovedFromMatch(targetPlayerId);
            this.emitUpdatePlayerList(matchCode);
            this.emitLockStatusChanged(matchCode);
        }
    }

    @SubscribeMessage(LobbyEvent.UpdatePlayer)
    updatePlayer(socket: Socket, updatedFields: Partial<Player>) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const players = this.matchService.getPlayers(matchCode);
        const player = players.find((p) => p.id === socket.id);

        Object.assign(player, updatedFields);
        if (updatedFields.name) {
            player.name = this.matchService.getUniqueName(updatedFields.name, socket.id);
        }

        this.emitUpdatePlayerList(matchCode);
    }

    @SubscribeMessage(LobbyEvent.StartMatch)
    startMatch(socket: Socket) {
        const matchCode = this.matchService.startMatch(socket.id);

        if (matchCode) {
            const match = this.matchService.getMatch(matchCode);
            this.server.to(matchCode).emit(LobbyEvent.MatchStarted, match);
        }
    }

    @SubscribeMessage(LobbyEvent.ChangeLockStatus)
    changeLockStatus(socket: Socket, isLocked: boolean) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(socket.id);
        const isAdmin = this.matchService.isPlayerAdmin(socket.id);

        if (isAdmin) {
            this.matchService.setMatchLockState(matchCode, isLocked);
            this.emitLockStatusChanged(matchCode);
        }
    }

    handleDisconnect(socket: Socket) {
        this.leaveMatch(socket);
    }

    private emitLockStatusChanged(gameCode: string): void {
        const lockedStatus = this.matchService.isMatchLocked(gameCode);
        this.server.to(gameCode).emit(LobbyEvent.LockStatusChanged, lockedStatus);
    }

    private emitUpdatePlayerList(matchCode: string): void {
        const players = this.matchService.getPlayers(matchCode);
        this.server.to(matchCode).emit(LobbyEvent.UpdatePlayerList, players);
    }

    private emitRemovedFromMatch(clientId: string): void {
        const socket = this.server.sockets.sockets.get(clientId);
        socket?.emit(LobbyEvent.RemovedFromMatch);
    }
}
