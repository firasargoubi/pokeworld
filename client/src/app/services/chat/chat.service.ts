import { inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { ChatMessage } from '@common/interfaces/chat-message';
import { ChatEvent } from '@common/interfaces/socket-event.enum';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    isChatActive = signal(true);
    isGeneralChatActive = signal(false);
    isFilterEnabled = signal(false);
    isComponentVisible = signal(true);
    generalMessages$: Observable<ChatMessage[]>;
    private readonly generalMessagesSignal = signal<ChatMessage[]>([]);
    private readonly socketService: SocketService = inject(SocketService);
    private readonly userService = inject(UserService);

    constructor() {
        this.socketService.on(ChatEvent.GeneralMessage, (chatMessage: ChatMessage) => {
            this.generalMessagesSignal.update((messages) => [...messages, chatMessage]);
        });
        this.generalMessages$ = toObservable(this.generalMessagesSignal);
    }

    sendMessage(message: string) {
        this.socketService.emit(ChatEvent.Message, message);
    }

    sendGeneralMessage(message: string) {
        const username = this.userService.currentUserSubject.value?.username ?? `User-${this.socketService.selfId}`;
        const chatMessage: ChatMessage = { sender: username, content: message, timestamp: new Date() };
        this.socketService.emit(ChatEvent.GeneralMessage, chatMessage);
    }
}
