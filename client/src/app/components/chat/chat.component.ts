import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '@app/services/chat/chat.service';
import { MatchService } from '@app/services/match/match.service';
import { MAX_MESSAGE_LENGTH } from '@common/consts/chat-message.const';
import { ChatLog, ChatMessage } from '@common/interfaces/chat-message';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class ChatComponent implements OnInit, AfterViewChecked {
    @ViewChild('chatContainer') private chatContainerRef: ElementRef;

    isChatActive: WritableSignal<boolean>;
    isFilterEnabled: WritableSignal<boolean>;
    maxInputLenght = MAX_MESSAGE_LENGTH;
    chatMessages: ChatMessage[] = [];
    logs: ChatLog[] = [];
    private shouldScrollToBottom = false;
    private readonly matchService: MatchService = inject(MatchService);
    private readonly chatService: ChatService = inject(ChatService);

    ngOnInit(): void {
        this.isChatActive = this.chatService.isChatActive;
        this.isFilterEnabled = this.chatService.isFilterEnabled;
        this.updateChatData();
        this.matchService.matchUpdate.subscribe(() => {
            this.updateChatData();
        });
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    switchTab(isChat: boolean): void {
        this.chatService.isChatActive.set(isChat);
        this.shouldScrollToBottom = true;
    }

    toggleFilter(): void {
        this.chatService.isFilterEnabled.update((value) => !value);
        this.filterLogs();
        this.shouldScrollToBottom = true;
    }

    sendMessage(event: KeyboardEvent) {
        if (event.key !== 'Enter') {
            return;
        }

        const input = event.target as HTMLInputElement;
        const message = input.value.trim();

        if (message) {
            input.value = '';
            this.chatService.sendMessage(message);
            this.shouldScrollToBottom = true;
        }
    }

    updateChatData(): void {
        this.chatMessages = this.matchService.data.chatData;
        this.filterLogs();
        this.shouldScrollToBottom = true;
    }

    private filterLogs(): void {
        const playerName = this.matchService.selfPlayer.name;
        if (this.isFilterEnabled()) {
            this.logs = this.matchService.data.logData.filter(
                (log) => log.content.includes(playerName) || log.concernedPlayersNamesList.includes(playerName),
            );
        } else {
            this.logs = this.matchService.data.logData.filter(
                (log) => log.concernedPlayersNamesList.length === 0 || log.concernedPlayersNamesList.includes(playerName),
            );
        }
    }

    private scrollToBottom(): void {
        if (this.chatContainerRef?.nativeElement) {
            const element = this.chatContainerRef.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }
}
