import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { ItemType } from '@common/interfaces/item-type.enum';
import { Position } from '@common/interfaces/position';
import { PlayEvent } from '@common/interfaces/socket-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class PlayGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

    @SubscribeMessage(PlayEvent.EndTurn)
    endTurn(socket: Socket) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            this.playService.endTurn(match, socket.id);
        }
    }

    @SubscribeMessage(PlayEvent.Move)
    move(socket: Socket, position: Position) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            this.playService.move(match, socket.id, position);
        }
    }

    @SubscribeMessage(PlayEvent.Action)
    action(socket: Socket, position: Position) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            this.playService.action(match, socket.id, position);
        }
    }

    @SubscribeMessage(PlayEvent.DebugMove)
    debugMove(socket: Socket, position: Position) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            this.playService.debugMove(match, socket.id, position);
        }
    }

    @SubscribeMessage(PlayEvent.ChangeDebugMode)
    changeDebugMode(socket: Socket, isDebugMode: boolean) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            this.playService.changeDebugMode(match, socket.id, isDebugMode);
        }
    }

    @SubscribeMessage(PlayEvent.DropItem)
    dropItem(socket: Socket, itemType: ItemType) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        if (match) {
            this.playService.dropItem(match, socket.id, itemType);
        }
    }
}
