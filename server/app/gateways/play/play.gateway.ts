import { PlayEvent } from '@common/play-event.enum';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchService } from '@app/services/match/match.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class PlayGateway {
    @WebSocketServer() private server: Server;
    @Inject(MatchService) private readonly matchService: MatchService;

    @SubscribeMessage(PlayEvent.EndTurn)
    endPlay(socket: Socket) {
        // eslint-disable-next-line no-console
        console.log('PlayGateway.endPlay()', socket.id);
    }
}
