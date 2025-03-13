import { TurnEvent } from '@common/turn-event.enum';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchService } from '@app/services/match/match.service';
import { TurnService } from '@app/services/turn/turn.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class TurnGateway {
    @WebSocketServer() private server: Server;
    @Inject(MatchService) private readonly matchService: MatchService;
    @Inject(TurnService) private readonly turnService: TurnService;

    @SubscribeMessage(TurnEvent.EndTurn)
    endTurn(socket: Socket) {
        this.turnService.endTurn(socket.id);
        // code
    }
}
