import { User } from '@app/model/schema/user.schema';
import { ChatService } from '@app/services/chat/chat.service';
import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
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
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService;

    @SubscribeMessage(ChatEvent.Message)
    async message(socket: Socket, message: string) {
        const match = this.matchService.getMatchFromPlayerId(socket.id);
        let user: User | null = null;
        const userId = this.userService.getUserId(socket.id);
        if (userId) {
            user = await this.userService.getUserById(userId);
        }
        if (match) {
            this.chatService.message(match, socket.id, message, user);
        }
    }
    @SubscribeMessage(ChatEvent.GeneralMessage)
    generalMessage(socket: Socket, chatMessage: ChatMessage) {
        const chatMessageToSend: ChatMessage = {
            sender: chatMessage.sender,
            content: chatMessage.content,
            profilePicture: chatMessage.profilePicture || null,
            timestamp: new Date(),
        };
        this.server.emit(ChatEvent.GeneralMessage, chatMessageToSend);
    }
}
