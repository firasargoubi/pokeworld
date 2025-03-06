import { inject, Injectable } from '@angular/core';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbyEvents } from '@common/lobby-events.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketsService {
    private chatHistory: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    private coreSocket: CoreSocketService = inject(CoreSocketService);

    constructor() {
        this.setupChatListeners();
    }

    get chatMessages() {
        return this.chatHistory.asObservable();
    }

    setupChatListeners(): void {
        this.coreSocket.on(LobbyEvents.NewMessage, (newChat: string) => {
            const currentHistory = this.chatHistory.getValue();

            const updatedHistory = [...currentHistory, newChat];

            this.chatHistory.next(updatedHistory);
        });
        this.coreSocket.on(LobbyEvents.ClearMessages, () => {
            this.chatHistory.next([]);
        });
    }
    sendMessage(message: string): void {
        this.coreSocket.emit(LobbyEvents.NewMessage, message);
    }
}
