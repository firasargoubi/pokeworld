import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { PopupMessage } from '@app/consts/popup-message.const';
import { ChatState } from '@app/interfaces/chat-state';
import { ChatTab } from '@app/interfaces/chat-tab.enum';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { RESERVED_CHANNEL_NAMES } from '@common/consts/reserved-channel-names.const';
import { Channel, ChannelMessage, ChannelUser } from '@common/interfaces/channel';
import { ChatMessage } from '@common/interfaces/chat-message';
import { ChatEvent } from '@common/interfaces/socket-event.enum';
import { UserInfo } from '@common/interfaces/user';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    chatState = signal<ChatState>({
        activeTab: ChatTab.Channels,
        isInChannelList: true,
        activeChannelName: undefined,
    });
    channels = signal<Channel[]>([]);
    isFilterEnabled = signal(false);
    isComponentVisible = signal(false);
    isWindowDetached = signal(false);
    detachedWindow: Window | null = null;
    activeChannelName = computed(() => this.chatState().activeChannelName ?? '');
    activeChannelMessages = computed(() => {
        const name = this.chatState().activeChannelName;
        return name ? this.channelMessages()[name] ?? [] : [];
    });
    generalMessages$: Observable<ChatMessage[]>;
    channelMessages$: Observable<Record<string, ChatMessage[]>>;
    user: UserInfo | null = null;
    private readonly channelMessages = signal<Record<string, ChatMessage[]>>({});
    private readonly generalMessagesSignal = signal<ChatMessage[]>([]);
    private readonly socketService: SocketService = inject(SocketService);
    private readonly userService = inject(UserService);
    private readonly popupService = inject(PopupService);

    constructor() {
        this.userService.user$.subscribe((user) => {
            if (this.user?.userId !== user?.userId) this.generalMessagesSignal.update(() => []);
            this.user = user;
            if (!user) {
                this.closeDetachedWindow();
            }
        });
        this.socketService.on(ChatEvent.GeneralMessage, (chatMessage: ChatMessage) => {
            if (this.user) this.generalMessagesSignal.update((messages) => [...messages, chatMessage]);
        });
        this.socketService.on(ChatEvent.ChannelUpdate, (channels: Channel[]) => {
            this.channels.set(channels);
            const actuallyInChannel =
                !!this.chatState().activeChannelName && channels.some((channel) => channel.name === this.chatState().activeChannelName);
            if (!actuallyInChannel) {
                this.chatState.update((state) => ({ ...state, isInChannelList: true, activeChannelName: undefined }));
            }
        });
        this.socketService.on(ChatEvent.ChannelMessage, (data: ChannelMessage) => {
            this.channelMessages.update((map) => ({
                ...map,
                [data.channelName]: [...(map[data.channelName] ?? []), data.message],
            }));
        });
        this.generalMessages$ = toObservable(this.generalMessagesSignal);
        this.channelMessages$ = toObservable(this.channelMessages);
    }

    isInChannel(channelName: string): boolean {
        const username = this.user?.username;
        if (!username) return false;
        const channel = this.channels().find((c) => c.name === channelName);
        return !!channel && channel.membersUsernames.includes(username);
    }

    switchTab(tab: ChatTab): void {
        this.chatState.update((state) => ({ ...state, activeTab: tab }));
    }

    showChannelList(): void {
        this.chatState.update((state) => ({ ...state, isInChannelList: true }));
    }

    openChannel(channelName: string): void {
        if (!channelName || !this.isInChannel(channelName)) {
            return;
        }
        this.chatState.update(() => ({
            activeTab: ChatTab.Channels,
            isInChannelList: false,
            activeChannelName: channelName,
        }));
    }

    createChannel(channelName: string): void {
        const username = this.user?.username;
        if (!username) return;
        const channelNameIsNotAllowed = RESERVED_CHANNEL_NAMES.includes(channelName.toLowerCase());
        const channelExists = this.channels().some((channel) => channel.name === channelName);
        if (channelExists || channelNameIsNotAllowed) {
            this.popupService.showPopup({
                message: PopupMessage.NameAlreadyExists,
                hasCloseButton: true,
                isConfirmation: false,
            });
            return;
        }
        const channelUser: ChannelUser = { channelName, userName: username };
        this.socketService.emit(ChatEvent.CreateChannel, channelUser, (channel: Channel) => {
            if (channel) {
                this.openChannel(channel.name);
            }
        });
    }

    joinChannel(channelName: string): void {
        const username = this.user?.username;
        if (!username) return;
        this.socketService.emit(ChatEvent.JoinChannel, { channelName, userName: username } as ChannelUser);
    }

    leaveChannel(channelName: string): void {
        const username = this.user?.username;
        if (!username) return;
        if (this.chatState().activeChannelName === channelName) this.showChannelList();
        this.socketService.emit(ChatEvent.LeaveChannel, { channelName, userName: username } as ChannelUser);
    }

    deleteChannel(channelName: string): void {
        const username = this.user?.username;
        if (!username) return;
        if (this.chatState().activeChannelName === channelName) this.showChannelList();
        this.socketService.emit(ChatEvent.DeleteChannel, { channelName, userName: username } as ChannelUser);
    }

    sendMessage(message: string): void {
        this.socketService.emit(ChatEvent.Message, message);
    }

    sendGeneralMessage(message: string): void {
        const username = this.user?.username;
        if (!username) {
            return;
        }
        const chatMessage: ChatMessage = {
            sender: username,
            content: message,
            timestamp: new Date(),
            profilePicture: this.user ? this.user.profilePicture : null,
        };
        this.socketService.emit(ChatEvent.GeneralMessage, chatMessage);
    }

    sendChannelMessage(channelName: string, message: string): void {
        const isSendingToActiveChannel = this.chatState().activeChannelName === channelName;
        if (!isSendingToActiveChannel || !this.isInChannel(channelName)) {
            return;
        }
        const username = this.user?.username;
        if (!username) {
            return;
        }
        const chatMessage: ChatMessage = {
            sender: username,
            content: message,
            timestamp: new Date(),
            profilePicture: this.user ? this.user.profilePicture : null,
        };
        const channelMessage: ChannelMessage = { channelName, message: chatMessage };
        this.socketService.emit(ChatEvent.ChannelMessage, channelMessage);
    }

    joinAllChannels(): void {
        const channels = this.channels();
        channels.forEach((channel) => {
            if (this.isInChannel(channel.name)) {
                this.joinChannel(channel.name);
            }
        });
    }

    private closeDetachedWindow(): void {
        const popup = this.detachedWindow;
        this.detachedWindow = null;
        this.isWindowDetached.set(false);

        if (popup && !popup.closed) {
            popup.close();
        }
    }
}
