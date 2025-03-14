import { PlayEvent } from '@common/play-event.enum';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayService } from '@app/services/play/play.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class PlayGateway {
    @WebSocketServer() private server: Server;
    @Inject(PlayService) private readonly playService: PlayService;

    @SubscribeMessage(PlayEvent.EndTurn)
    endTurn(socket: Socket) {
        this.playService.endTurn(socket.id);
    }
}
