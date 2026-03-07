import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatTab } from '@app/interfaces/chat-tab.enum';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { MatchService } from '@app/services/match/match.service';
import { MAX_MESSAGE_LENGTH } from '@common/consts/chat-message.const';
import { ChatLog, ChatMessage } from '@common/interfaces/chat-message';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
})
export class ChatComponent implements OnInit, AfterViewChecked {
    @Input() hideLabels: boolean = false;
    @Input() scaleFactor: number = 1;
    @Input() isInGame: boolean = true;
    @ViewChild('chatContainer') private chatContainerRef: ElementRef;

    isComponentVisible: boolean = false;
    maxInputLength = MAX_MESSAGE_LENGTH;
    chatMessages: ChatMessage[] = [];
    logs: ChatLog[] = [];
    searchBarValue: string = '';
    readonly chatTab = ChatTab;
    readonly clickValue = SoundEffect.Click;
    readonly audioService: AudioService = inject(AudioService);
    readonly chatService: ChatService = inject(ChatService);
    private shouldScrollToBottom = false;
    private readonly matchService: MatchService = inject(MatchService);
    private readonly i18nService: I18nService = inject(I18nService);

    get filteredChannels() {
        const filter = this.searchBarValue.trim().toLowerCase();
        return this.chatService.channels().filter((c) => c.name.toLowerCase().startsWith(filter));
    }

    ngOnInit(): void {
        this.isComponentVisible = this.chatService.isComponentVisible();
        this.updateChatData();
        this.chatService.generalMessages$.subscribe(() => {
            this.shouldScrollToBottom = true;
        });
        this.chatService.channelMessages$.subscribe(() => {
            this.shouldScrollToBottom = true;
        });
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

    switchTab(tab: ChatTab): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.chatService.switchTab(tab);
        this.shouldScrollToBottom = true;
    }

    openChannel(channelName: string): void {
        this.audioService.playEffect(SoundEffect.Click);
        if (!this.chatService.isInChannel(channelName)) {
            return;
        }
        this.chatService.openChannel(channelName);
        this.shouldScrollToBottom = true;
    }

    showChannelList(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.chatService.showChannelList();
    }

    joinChannel(channelName: string, event?: MouseEvent): void {
        event?.stopPropagation();
        this.audioService.playEffect(SoundEffect.Click);
        this.chatService.joinChannel(channelName);
    }

    leaveChannel(channelName?: string, event?: MouseEvent): void {
        const name = channelName ?? this.chatService.activeChannelName();
        if (!name) return;
        event?.stopPropagation();
        this.audioService.playEffect(SoundEffect.Click);
        this.chatService.leaveChannel(name);
    }

    deleteChannel(channelName?: string, event?: MouseEvent): void {
        const name = channelName ?? this.chatService.activeChannelName();
        if (!name) return;
        event?.stopPropagation();
        this.audioService.playEffect(SoundEffect.Click);
        this.chatService.deleteChannel(name);
    }
    createChannel(): void {
        const name = this.searchBarValue.trim();
        if (name) {
            this.chatService.createChannel(name);
            this.searchBarValue = '';
        }
    }

    toggleFilter(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.chatService.isFilterEnabled.update((value: boolean) => !value);
        this.filterLogs();
        this.shouldScrollToBottom = true;
    }

    sendMessage(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            if (this.chatService.chatState().activeTab !== ChatTab.Journal) return;
            this.switchTab(ChatTab.Match);
            return;
        }

        const input = event.target as HTMLInputElement;
        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        const state = this.chatService.chatState();

        switch (state.activeTab) {
            case ChatTab.General:
                this.chatService.sendGeneralMessage(message);
                break;
            case ChatTab.Match:
                this.chatService.sendMessage(message);
                break;
            case ChatTab.Channels:
                if (state.activeChannelName) this.chatService.sendChannelMessage(state.activeChannelName, message);
                break;
        }
        this.shouldScrollToBottom = true;
    }

    switchVisibility(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.isComponentVisible = !this.isComponentVisible;
        this.chatService.isComponentVisible.set(this.isComponentVisible);
    }

    private updateChatData(): void {
        this.chatMessages = this.matchService.data.chatData;
        this.filterLogs();
        this.shouldScrollToBottom = true;
    }

    private filterLogs(): void {
        const playerName = this.matchService.selfPlayer.name;
        if (this.chatService.isFilterEnabled()) {
            this.logs = this.matchService.data.logData.filter(
                (log) => this.resolveLogContent(log).includes(playerName) || log.concernedPlayersNamesList.includes(playerName),
            );
        } else {
            this.logs = this.matchService.data.logData.filter(
                (log) => log.concernedPlayersNamesList.length === 0 || log.concernedPlayersNamesList.includes(playerName),
            );
        }
    }

    private resolveLogContent(log: ChatLog): string {
        return this.i18nService.translate(log.content, log.messageParams);
    }

    private scrollToBottom(): void {
        if (this.chatContainerRef?.nativeElement) {
            const element = this.chatContainerRef.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }
}
