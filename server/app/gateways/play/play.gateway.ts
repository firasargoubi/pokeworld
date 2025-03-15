import { PlayEvent } from '@common/play-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayService } from '@app/services/play/play.service';
import { Match } from '@common/match';

@WebSocketGateway({ cors: true })
@Injectable()
export class PlayGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

    @SubscribeMessage(PlayEvent.EndTurn)
    endTurn(socket: Socket) {
        this.playService.endTurn(socket.id);
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
