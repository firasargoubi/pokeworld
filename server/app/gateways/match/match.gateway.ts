import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
import { GameData } from '@common/interfaces/game-data';
import { MatchData } from '@common/interfaces/match-data';
import { MessageFromServer } from '@common/interfaces/message-from-server';
import { JoinPageEvent, MatchEvent, UserEvent } from '@common/interfaces/socket-event.enum';
import { UserInfo } from '@common/interfaces/user';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService;

    @SubscribeMessage(MatchEvent.CreateMatch)
    async createMatch(socket: Socket, gameData: GameData): Promise<MatchData | null> {
        const playerId = this.userService.getUserId(socket.id);
        if (!playerId) {
            return null;
        }
        return this.matchService.createMatch(playerId, gameData);
    }

    @SubscribeMessage(MatchEvent.JoinMatch)
    async joinMatch(socket: Socket, payload: { matchCode: string; confirmJoinBlockedUser?: boolean }): Promise<MatchData | null> {
        const playerId = this.userService.getUserId(socket.id);
        if (!playerId) {
            return null;
        }
        const matchCode = payload.matchCode;
        const confirmJoinBlockedUser = payload.confirmJoinBlockedUser ?? true;
        return await this.matchService.joinMatch(playerId, matchCode, confirmJoinBlockedUser);
    }

    @SubscribeMessage(MatchEvent.LeaveMatch)
    leaveMatch(socket: Socket) {
        const playerId = this.userService.getUserId(socket.id);
        if (!playerId) {
            return;
        }
        this.matchService.leaveMatch(playerId);
    }

    @SubscribeMessage(UserEvent.Associate)
    onUserAssociate(socket: Socket, user: UserInfo) {
        if (user) {
            this.userService.associateSocket(user.userId, socket.id);
        } else {
            this.userService.disassociateSocketBySocketId(socket.id);
        }
    }

    @SubscribeMessage(JoinPageEvent.JoinRoom)
    async handleJoinRoom(socket: Socket) {
        socket.join(JoinPageEvent.Room);
        const userId = this.userService.getUserId(socket.id);
        const matches = await this.matchService.getAvailableMatches(userId);
        socket.emit(JoinPageEvent.UpdateMatchList, matches);
    }

    @SubscribeMessage(JoinPageEvent.LeaveRoom)
    handleLeaveRoom(socket: Socket) {
        socket.leave(JoinPageEvent.Room);
    }

    async broadcastMatchListUpdate() {
        const sockets = this.server.sockets.sockets;
        sockets.forEach(async (socket) => {
            if (socket.rooms.has(JoinPageEvent.Room)) {
                const userId = this.userService.getUserId(socket.id);
                const matches = await this.matchService.getAvailableMatches(userId);
                socket.emit(JoinPageEvent.UpdateMatchList, matches);
            }
        });
    }

    handleDisconnect(socket: Socket) {
        this.leaveMatch(socket);
        const userId = this.userService.getUserId(socket.id);
        if (userId) {
            this.userService.logout(userId);
        }
    }

    connectPlayer(playerId: string, matchCode: string) {
        const socketId = this.userService.getSocketId(playerId);
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
            socket.join(matchCode);
        }
    }

    disconnectPlayer(playerId: string) {
        const socketId = this.userService.getSocketId(playerId);
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
            socket.rooms.forEach((room) => {
                socket.leave(room);
            });
        }
    }

    emitUpdate(matchCode: string, matchData: MatchData) {
        this.server.to(matchCode).emit(MatchEvent.Update, matchData);
    }

    emitMessage(matchCode: string, message: string, toHost: boolean = false, messageParams?: Record<string, string | number | boolean>) {
        const messageFromServer: MessageFromServer = {
            message,
            hasCloseButton: toHost,
        };
        if (messageParams) {
            messageFromServer.messageParams = messageParams;
        }

        if (toHost) {
            const socketId = this.userService.getSocketId(matchCode);
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.emit(MatchEvent.Message, messageFromServer);
            }
        } else {
            this.server.to(matchCode).emit(MatchEvent.Message, messageFromServer);
        }
    }

    emitRemovedFromMatch(playerId: string, reason: string) {
        const socketId = this.userService.getSocketId(playerId);
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
            socket.emit(MatchEvent.RemovedFromMatch, reason);
        }
    }
}
