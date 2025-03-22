import { MatchService } from '@app/services/match/match.service';
import { GameData } from '@common/interfaces/game-data';
import { Warning } from '@common/interfaces/warning.enum';
import { LobbyEvent, PlayEvent } from '@common/interfaces/websocket-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;

    @SubscribeMessage(LobbyEvent.CreateMatch)
    createMatch(socket: Socket, gameData: GameData): string {
        return this.matchService.createMatch(socket.id, gameData);
    }

    @SubscribeMessage(LobbyEvent.JoinMatch)
    joinMatch(socket: Socket, matchCode: string): boolean {
        return this.matchService.joinMatch(socket.id, matchCode);
    }

    @SubscribeMessage(LobbyEvent.LeaveMatch)
    leaveMatch(socket: Socket) {
        this.matchService.leaveMatch(socket.id);
    }

    @SubscribeMessage(PlayEvent.EndTurn)
    endTurn(socket: Socket) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            match.endTurn(socket.id);
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

    emitWarning(matchCode: string, warning: Warning) {
        this.server.to(matchCode).emit(LobbyEvent.Warning, warning);
    }

    // emitDebugModeChanged(matchCode: string, matchData: MatchData) {
    //     this.server.to(matchCode).emit(PlayEvent.DebugModeChanged, matchData);
    // }
}
