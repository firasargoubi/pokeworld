import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, inject, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
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
    isDetachedWindow = false;
    private shouldScrollToBottom = false;
    private detachedWindow: Window | null = null;
    private detachPlaceholder: Comment | null = null;
    private readonly detachedWindowName = 'pokeworld-chat-window';
    private readonly detachedWindowWidth = 520;
    private readonly detachedWindowHeight = 760;
    private readonly detachedWindowFeatures = `width=${this.detachedWindowWidth},height=${this.detachedWindowHeight},resizable=yes`;
    private readonly detachedWindowTitleKey = 'components.chat.windowTitle';
    private readonly hostElementRef = inject(ElementRef<HTMLElement>);
    private readonly ngZone = inject(NgZone);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly matchService: MatchService = inject(MatchService);
    private readonly i18nService: I18nService = inject(I18nService);
    private shouldRestoreDetachedMode = false;
    private detachedWindowCloseHandler: (() => void) | null = null;

    get filteredChannels() {
        const filter = this.searchBarValue.trim().toLowerCase();
        return this.chatService.channels().filter((c) => c.name.toLowerCase().startsWith(filter));
    }

    ngOnInit(): void {
        this.isComponentVisible = this.chatService.isComponentVisible();
        if (this.chatService.detachedWindow?.closed) {
            this.chatService.detachedWindow = null;
            this.chatService.isWindowDetached.set(false);
        }
        this.shouldRestoreDetachedMode = this.chatService.isWindowDetached() && !!this.chatService.detachedWindow;
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
        if (this.shouldRestoreDetachedMode && !this.isDetachedWindow) {
            this.shouldRestoreDetachedMode = false;
            this.detachToExternalWindow(false);
            return;
        }

        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    ngOnDestroy(): void {
        this.releaseDetachedWindowBinding();
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
        this.sendMessageFromInput(input);
    }

    sendMessageFromButton(input: HTMLInputElement): void {
        this.audioService.playEffect(this.clickValue);
        this.sendMessageFromInput(input);
    }

    switchVisibility(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.isComponentVisible = !this.isComponentVisible;
        this.chatService.isComponentVisible.set(this.isComponentVisible);
    }

    toggleWindowMode(): void {
        this.audioService.playEffect(SoundEffect.Click);
        if (this.isDetachedWindow) {
            this.reattachToMainWindow();
            return;
        }

        this.detachToExternalWindow(true);
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

    private sendMessageFromInput(input: HTMLInputElement): void {
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

    private scrollToBottom(): void {
        if (this.chatContainerRef?.nativeElement) {
            const element = this.chatContainerRef.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }

    private detachToExternalWindow(shouldFocusWindow = true): void {
        const existingPopup = this.chatService.detachedWindow;
        const isReusingPopup = !!existingPopup && !existingPopup.closed;
        const popup = isReusingPopup ? existingPopup : window.open('', this.detachedWindowName, this.detachedWindowFeatures);
        if (!popup) {
            return;
        }

        const hostElement = this.hostElementRef.nativeElement;
        const parentNode = hostElement.parentNode;
        if (!parentNode) {
            popup.close();
            return;
        }

        this.detachPlaceholder = document.createComment('chat-detach-placeholder');
        parentNode.insertBefore(this.detachPlaceholder, hostElement);

        popup.document.title = 'PokeWorld - ' + this.i18nService.translate(this.detachedWindowTitleKey);
        popup.document.body.style.margin = '0';
        popup.document.body.style.overflow = 'hidden';
        if (!isReusingPopup) {
            this.copyStylesToPopup(popup.document);
        }
        popup.document.body.appendChild(hostElement);

        this.unregisterPopupCloseHandlers();
        const handlePopupClose = () => {
            this.ngZone.run(() => {
                this.reattachToMainWindow(true);
                this.changeDetectorRef.detectChanges();
            });
        };
        popup.addEventListener('beforeunload', handlePopupClose);
        popup.addEventListener('unload', handlePopupClose);
        this.detachedWindowCloseHandler = handlePopupClose;

        this.detachedWindow = popup;
        this.chatService.detachedWindow = popup;
        this.isDetachedWindow = true;
        this.chatService.isWindowDetached.set(true);
        this.changeDetectorRef.detectChanges();
        if (shouldFocusWindow) {
            popup.focus();
        }
    }

    private reattachToMainWindow(isClosingExternalWindow = false): void {
        if (!this.isDetachedWindow) {
            return;
        }

        this.unregisterPopupCloseHandlers();

        const hostElement = this.hostElementRef.nativeElement;
        if (this.detachPlaceholder?.parentNode) {
            this.detachPlaceholder.parentNode.insertBefore(hostElement, this.detachPlaceholder);
            this.detachPlaceholder.parentNode.removeChild(this.detachPlaceholder);
        }

        this.detachPlaceholder = null;
        const popup = this.detachedWindow;
        this.detachedWindow = null;
        this.chatService.detachedWindow = null;
        this.isDetachedWindow = false;
        this.chatService.isWindowDetached.set(false);
        this.changeDetectorRef.detectChanges();

        if (!isClosingExternalWindow && popup && !popup.closed) {
            popup.close();
        }
    }

    private copyStylesToPopup(targetDocument: Document): void {
        const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
        styleNodes.forEach((node) => {
            targetDocument.head.appendChild(node.cloneNode(true));
        });
    }

    private releaseDetachedWindowBinding(): void {
        if (!this.chatService.isWindowDetached()) {
            return;
        }

        this.unregisterPopupCloseHandlers();
        this.detachedWindow = null;
        this.isDetachedWindow = false;

        if (this.detachPlaceholder?.parentNode) {
            this.detachPlaceholder.parentNode.removeChild(this.detachPlaceholder);
        }
        this.detachPlaceholder = null;

        const hostElement = this.hostElementRef.nativeElement;
        if (hostElement.parentNode) {
            hostElement.parentNode.removeChild(hostElement);
        }
    }

    private unregisterPopupCloseHandlers(): void {
        if (!this.detachedWindow || !this.detachedWindowCloseHandler) {
            return;
        }

        this.detachedWindow.removeEventListener('beforeunload', this.detachedWindowCloseHandler);
        this.detachedWindow.removeEventListener('unload', this.detachedWindowCloseHandler);
        this.detachedWindowCloseHandler = null;
    }
}
