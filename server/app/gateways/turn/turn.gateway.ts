import { TurnEvent } from '@common/turn-event.enum';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchService } from '@app/services/match/match.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class TurnGateway {
    @WebSocketServer() private server: Server;
    @Inject(MatchService) private readonly matchService: MatchService;

    @SubscribeMessage(TurnEvent.EndTurn)
    endTurn(socket: Socket) {
        // eslint-disable-next-line no-console
        console.log('TurnGateway.endTurn()', socket.id);
    }
}
