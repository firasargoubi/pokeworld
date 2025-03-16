import { PlayService } from '@app/services/play/play.service';
import { Match, PlayerMovementData } from '@common/match';
import { PlayEvent } from '@common/play-event.enum';
import { Position } from '@common/position';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class PlayGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

    @SubscribeMessage(PlayEvent.EndTurn)
    endTurn(socket: Socket) {
        this.playService.endTurn(socket.id);
    }

    @SubscribeMessage(PlayEvent.GetPossibleMoves)
    getPossibleMoves(socket: Socket): Position[] {
        return this.playService.getPossibleMoves(socket.id);
    }

    @SubscribeMessage(PlayEvent.GetHoverMoves)
    getHoverMoves(socket: Socket, position: Position): Position[] {
        return this.playService.getHoverMoves(socket.id, position);
    }

    @SubscribeMessage(PlayEvent.Move)
    move(socket: Socket, position: Position) {
        this.playService.move(socket.id, position);
    }

    emitPlayerMoved(matchCode: string, playerMovementData: PlayerMovementData) {
        this.server.to(matchCode).emit(PlayEvent.PlayerMoved, playerMovementData);
    }

    emitMatchStarted(matchCode: string, match: Match) {
        this.server.to(matchCode).emit(PlayEvent.MatchStarted, match);
    }

    emitTurnStarted(matchCode: string, match: Match) {
        this.server.to(matchCode).emit(PlayEvent.TurnStarted, match);
    }

    emitPreTurnStarted(matchCode: string, match: Match) {
        this.server.to(matchCode).emit(PlayEvent.PreTurnStarted, match);
    }
}
