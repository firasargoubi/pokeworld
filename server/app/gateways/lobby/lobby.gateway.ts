import { LobbyEvent } from '@common/lobby-event.enum';
import { Player } from '@common/player';
import { Inject, Injectable } from '@nestjs/common';
import { GameData } from '@common/game-data';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from '@app/services/lobby/lobby.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class LobbyGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject(LobbyService) private readonly lobbyService: LobbyService;

    @SubscribeMessage(LobbyEvent.CreateMatch)
    createMatch(socket: Socket, gameData: GameData): string {
        return this.lobbyService.createMatch(socket.id, gameData);
    }

    @SubscribeMessage(LobbyEvent.JoinMatch)
    joinMatch(socket: Socket, matchCode: string): boolean {
        return this.lobbyService.joinMatch(socket.id, matchCode);
    }

    @SubscribeMessage(LobbyEvent.LeaveMatch)
    leaveMatch(socket: Socket) {
        this.lobbyService.leaveMatch(socket.id);
    }

    @SubscribeMessage(LobbyEvent.KickPlayer)
    kickPlayer(socket: Socket, targetPlayerId: string) {
        this.lobbyService.tryKickPlayer(socket.id, targetPlayerId);
    }

    @SubscribeMessage(LobbyEvent.UpdatePlayer)
    updatePlayer(socket: Socket, updatedFields: Partial<Player>) {
        this.lobbyService.updatePlayer(socket.id, updatedFields);
    }

    @SubscribeMessage(LobbyEvent.StartMatch)
    startMatch(socket: Socket) {
        this.lobbyService.startMatch(socket.id);
    }

    @SubscribeMessage(LobbyEvent.ChangeLockStatus)
    changeLockStatus(socket: Socket, isLocked: boolean) {
        this.lobbyService.changeLockStatus(socket.id, isLocked);
    }

    handleDisconnect(socket: Socket) {
        this.leaveMatch(socket);
    }

    connectPlayer(playerId: string, matchCode: string) {
        const socket = this.server.sockets.sockets.get(playerId);
        if (socket) {
            socket.join(matchCode);
        }
    }

    disconnectPlayer(playerId: string) {
        const socket = this.server.sockets.sockets.get(playerId);
        if (socket) {
            socket.rooms.forEach((room) => {
                socket.leave(room);
            });
        }
    }

    emitLockStatusChanged(matchCode: string, lockedStatus: boolean) {
        this.server.to(matchCode).emit(LobbyEvent.LockStatusChanged, lockedStatus);
    }

    emitUpdatePlayerList(matchCode: string, players: Player[]) {
        this.server.to(matchCode).emit(LobbyEvent.UpdatePlayerList, players);
    }

    emitRemovedFromMatch(clientId: string): void {
        const socket = this.server.sockets.sockets.get(clientId);
        if (socket) {
            socket.emit(LobbyEvent.RemovedFromMatch);
        }
    }

    warn(playerId: string, message: string) {
        const socket = this.server.sockets.sockets.get(playerId);
        if (socket) {
            socket.emit(LobbyEvent.Warning, message);
        }
    }
}
