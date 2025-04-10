import { inject, Injectable, signal } from '@angular/core';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ChatMessage } from '@common/interfaces/chat-message';
import { ChatEvent } from '@common/interfaces/socket-event.enum';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    isChatActive = signal(true);
    isFilterEnabled = signal(false);
    private readonly matchService: MatchService = inject(MatchService);
    private readonly socketService: SocketService = inject(SocketService);

    sendMessage(message: string): void {
        const chatMessage: ChatMessage = {
            content: message,
            sender: this.matchService.selfPlayer.name,
            timestamp: new Date(),
        };
        this.socketService.emit(ChatEvent.NewMessage, chatMessage);
    }
}
