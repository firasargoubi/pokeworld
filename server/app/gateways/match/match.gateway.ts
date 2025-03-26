import { MatchService } from '@app/services/match/match.service';
import { GameData } from '@common/interfaces/game-data';
import { MatchData } from '@common/interfaces/match-data';
import { MatchEvent } from '@common/interfaces/socket-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;

    @SubscribeMessage(MatchEvent.CreateMatch)
    createMatch(socket: Socket, gameData: GameData): MatchData | null {
        return this.matchService.createMatch(socket.id, gameData);
    }

    @SubscribeMessage(MatchEvent.JoinMatch)
    joinMatch(socket: Socket, matchCode: string): MatchData | null {
        return this.matchService.joinMatch(socket.id, matchCode);
    }

    @SubscribeMessage(MatchEvent.LeaveMatch)
    leaveMatch(socket: Socket) {
        this.matchService.leaveMatch(socket.id);
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

    emitUpdate(matchCode: string, matchData: MatchData) {
        this.server.to(matchCode).emit(MatchEvent.Update, matchData);
    }

    emitMessage(matchCode: string, message: string) {
        this.server.to(matchCode).emit(MatchEvent.Message, message);
    }

    emitRemovedFromMatch(matchCode: string, reason: string) {
        this.server.to(matchCode).emit(MatchEvent.RemovedFromMatch, reason);
    }
}
