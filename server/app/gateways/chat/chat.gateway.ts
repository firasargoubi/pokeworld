import { User } from '@app/model/schema/user.schema';
import { ChatService } from '@app/services/chat/chat.service';
import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
import { Channel, ChannelMessage, ChannelUser } from '@common/interfaces/channel';
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
        const userId = this.userService.getUserId(socket.id);
        const match = this.matchService.getMatchFromPlayerId(userId);
        let user: User | null = null;
        if (userId) {
            user = await this.userService.getUserById(userId);
        }
        if (match) {
            this.chatService.message(match, userId, message, user);
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

    @SubscribeMessage(ChatEvent.CreateChannel)
    async createChannel(socket: Socket, channelUser: ChannelUser): Promise<Channel> {
        const channelName = channelUser.channelName;
        const userName = channelUser.userName;
        const channel = await this.chatService.createChannel(channelName, userName);
        if (!channel) {
            return null;
        }
        socket.join(channel.name);
        this.server.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
        return channel;
    }

    @SubscribeMessage(ChatEvent.JoinChannel)
    async joinChannel(socket: Socket, channelUser: ChannelUser): Promise<void> {
        const channelName = channelUser.channelName;
        const userName = channelUser.userName;
        await this.chatService.joinChannel(channelName, userName);
        socket.join(channelName);
        this.server.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }

    @SubscribeMessage(ChatEvent.LeaveChannel)
    async leaveChannel(socket: Socket, channelUser: ChannelUser): Promise<void> {
        const channelName = channelUser.channelName;
        const userName = channelUser.userName;
        await this.chatService.leaveChannel(channelName, userName);
        socket.leave(channelName);
        this.server.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }

    @SubscribeMessage(ChatEvent.DeleteChannel)
    async deleteChannel(socket: Socket, channelUser: ChannelUser): Promise<void> {
        const channelName = channelUser.channelName;
        const userName = channelUser.userName;
        const isUserInChannel = await this.chatService.isUserInChannel(channelName, userName);
        if (!isUserInChannel) {
            return;
        }
        await this.chatService.deleteChannel(channelName);
        socket.leave(channelName);
        this.server.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }

    @SubscribeMessage(ChatEvent.ChannelMessage)
    channelMessage(socket: Socket, data: ChannelMessage): void {
        this.server.to(data.channelName).emit(ChatEvent.ChannelMessage, data);
    }

    async handleConnection(socket: Socket): Promise<void> {
        socket.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }
}
