import { MatchService } from '@app/services/match/match.service';
import { LobbyEvent, PlayEvent } from '@common/interfaces/websocket-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;

    @SubscribeMessage(PlayEvent.EndTurn)
    endTurn(socket: Socket) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            match.endTurn(socket.id);
        }
    }

    @SubscribeMessage(LobbyEvent.LeaveMatch)
    leaveMatch(socket: Socket) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            match.leaveMatch(socket.id);
        }
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

    emitDebugModeChanged(matchCode: string, match: Match) {
        this.server.to(matchCode).emit(MatchEvent.DebugModeChanged, match);
    }
}
