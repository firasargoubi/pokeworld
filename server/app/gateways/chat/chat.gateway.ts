import { ChatService } from '@app/services/chat/chat.service';
import { SocialService } from '@app/services/social/social.service';
import { UserService } from '@app/services/user/user.service';
import { MAX_MESSAGE_LENGTH } from '@common/consts/chat-message.const';
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
    @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService;
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService;
    @Inject(forwardRef(() => SocialService)) private readonly socialService: SocialService;

    @SubscribeMessage(ChatEvent.GeneralMessage)
    async generalMessage(socket: Socket, chatMessage: ChatMessage) {
        const chatMessageToSend: ChatMessage = {
            sender: chatMessage.sender,
            senderId: this.userService.getUserId(socket.id),
            content: chatMessage.content,
            profilePicture: chatMessage.profilePicture || null,
            timestamp: new Date(),
        };

        await this.emitWithBlockFilter(socket.id, ChatEvent.GeneralMessage, chatMessageToSend);
    }

    @SubscribeMessage(ChatEvent.CreateChannel)
    async createChannel(socket: Socket, channelUser: ChannelUser): Promise<Channel> {
        const channelName = channelUser.channelName;
        const userId = this.userService.getUserId(socket.id);
        const isDedicatedChannel = channelUser.isDedicatedChannel;
        const channel = await this.chatService.createChannel(channelName, userId, isDedicatedChannel);
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
        const userId = this.userService.getUserId(socket.id);
        await this.chatService.joinChannel(channelName, userId);
        socket.join(channelName);
        this.server.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }

    @SubscribeMessage(ChatEvent.LeaveChannel)
    async leaveChannel(socket: Socket, channelUser: ChannelUser): Promise<void> {
        const channelName = channelUser.channelName;
        const userId = this.userService.getUserId(socket.id);
        await this.chatService.leaveChannel(channelName, userId);
        socket.leave(channelName);
        this.server.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }

    @SubscribeMessage(ChatEvent.DeleteChannel)
    async deleteChannel(socket: Socket, channelUser: ChannelUser): Promise<void> {
        const channelName = channelUser.channelName;
        const userId = this.userService.getUserId(socket.id);
        const isUserInChannel = await this.chatService.isUserInChannel(channelName, userId);
        if (!isUserInChannel) {
            return;
        }
        await this.chatService.deleteChannel(channelName);
        socket.leave(channelName);
        this.server.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }

    @SubscribeMessage(ChatEvent.ChannelMessage)
    async channelMessage(socket: Socket, data: ChannelMessage): Promise<void> {
        if (data.message.content.trim().length > MAX_MESSAGE_LENGTH) return;
        data.message.senderId = this.userService.getUserId(socket.id);
        await this.emitWithBlockFilter(socket.id, ChatEvent.ChannelMessage, data, data.channelName);
    }

    async handleConnection(socket: Socket): Promise<void> {
        socket.emit(ChatEvent.ChannelUpdate, await this.chatService.getChannels());
    }

    private async emitWithBlockFilter(senderSocketId: string, event: string, data: ChannelMessage | ChatMessage, room?: string): Promise<void> {
        const senderId = this.userService.getUserId(senderSocketId);
        const relationships = senderId ? await this.socialService.getRelationships(senderId) : null;
        const blocked = relationships ? [...relationships.blockedUsers, ...relationships.blockedByUsers] : [];

        for (const [, socket] of this.server.sockets.sockets) {
            if (room && !socket.rooms.has(room)) continue;
            const userId = this.userService.getUserId(socket.id);
            if (blocked.includes(userId)) continue;
            socket.emit(event, data);
        }
    }
}
