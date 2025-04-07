import { ChatService } from '@app/services/chat/chat.service';
import { MatchService } from '@app/services/match/match.service';
import { ChatMessage } from '@common/interfaces/chat-message';
import { ChatEvent } from '@common/interfaces/socket-event.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;
    @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService;

    @SubscribeMessage(ChatEvent.NewMessage)
    handleNewMessage(client: Socket, message: ChatMessage): void {
        const match = this.matchService.getMatchFromPlayerId(client.id);
        this.chatService.addMessageToMatch(match, message);
    }
}
