import { ElementRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatTab } from '@app/interfaces/chat-tab.enum';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { MatchService } from '@app/services/match/match.service';
import { ChatLog } from '@common/interfaces/chat-message';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let matchServiceSpy: jasmine.SpyObj<MatchService>;
    let i18nServiceSpy: jasmine.SpyObj<I18nService>;
    let scrollToBottomSpy: jasmine.Spy;
    let mockAudioService: jasmine.SpyObj<AudioService>;

    const mockLogData: ChatLog[] = [
        { sender: 'System', content: 'Player1 joined the game', timestamp: new Date(), concernedPlayersNamesList: ['Player1'] },
        { sender: 'System', content: 'Player2 joined the game', timestamp: new Date(), concernedPlayersNamesList: ['Player2'] },
        { sender: 'System', content: 'Game started', timestamp: new Date(), concernedPlayersNamesList: [] },
    ];

    beforeEach(async () => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage', 'sendGeneralMessage', 'switchTab', 'channels'], {
            chatState: signal({ activeTab: ChatTab.Channels, isInChannelList: true, activeChannelName: undefined }),
            isChatActive: signal(true),
            isGeneralChatActive: signal(false),
            isFilterEnabled: signal(false),
            isComponentVisible: signal(true),
            isWindowDetached: signal(false),
            generalMessages$: of([]),
            channelMessages$: of({}),
        });
        chatServiceSpy.channels.and.returnValue([]);

        matchServiceSpy = jasmine.createSpyObj('MatchService', [], {
            data: {
                logData: mockLogData,
            },
            selfPlayer: { name: 'Player1' },
            matchUpdate: {
                subscribe: (callback: () => void) => {
                    callback();
                    return { unsubscribe: () => undefined };
                },
            },
        });
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'preloadEffectsForPage']);
        i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate']);
        i18nServiceSpy.translate.and.callFake((message: string) => message);

        await TestBed.configureTestingModule({
            imports: [ChatComponent, FormsModule, TranslateModule.forRoot()],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: MatchService, useValue: matchServiceSpy },
                { provide: AudioService, useValue: mockAudioService },
                { provide: I18nService, useValue: i18nServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        scrollToBottomSpy = spyOn<any>(component, 'scrollToBottom');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should switch between chat and logs tabs', () => {
        component.switchTab(ChatTab.Channels);
        expect(chatServiceSpy.switchTab).toHaveBeenCalledWith(ChatTab.Channels);

        component.switchTab(ChatTab.General);
        expect(chatServiceSpy.switchTab).toHaveBeenCalledWith(ChatTab.General);

        component.switchTab(ChatTab.Journal);
        expect(chatServiceSpy.switchTab).toHaveBeenCalledWith(ChatTab.Journal);

        component.switchTab(ChatTab.Match);
        expect(chatServiceSpy.switchTab).toHaveBeenCalledWith(ChatTab.Match);
    });

    it('should toggle filter', () => {
        component.toggleFilter();
        expect(chatServiceSpy.isFilterEnabled()).toBeTrue();
        expect(component.logs.length).toBe(1);
    });

    it('should send message on Enter key', async () => {
        const input = document.createElement('input');
        input.value = 'Test message';

        // ensure we're on Match tab so component calls sendMessage
        chatServiceSpy.chatState.set({ activeTab: ChatTab.Match, isInChannelList: true, activeChannelName: undefined });

        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(event, 'target', { value: input });

        component.sendMessage(event);

        expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith('Test message');
        expect(input.value).toBe('');
    });

    it('should not send message on other keys', async () => {
        const input = document.createElement('input');
        input.value = 'Test message';

        const event = new KeyboardEvent('keydown', { key: 'A' });
        Object.defineProperty(event, 'target', { value: input });

        component.sendMessage(event);

        expect(chatServiceSpy.sendMessage).not.toHaveBeenCalled();
        expect(input.value).toBe('Test message');
    });

    it('should not send empty messages', async () => {
        const input = document.createElement('input');
        input.value = '   ';

        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(event, 'target', { value: input });

        component.sendMessage(event);

        expect(chatServiceSpy.sendMessage).not.toHaveBeenCalled();
    });

    it('should filter logs based on player name when filter is enabled', () => {
        chatServiceSpy.isFilterEnabled.set(true);

        component['filterLogs']();

        expect(component.logs.length).toBe(1);
        expect(component.logs[0].concernedPlayersNamesList).toContain('Player1');
    });

    it('should correctly call scrollToBottom method when needed', () => {
        scrollToBottomSpy.and.callThrough();

        const mockElement = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 100,
            },
        };

        component['chatContainerRef'] = mockElement as ElementRef;

        component['shouldScrollToBottom'] = true;

        component.ngAfterViewChecked();

        expect(mockElement.nativeElement.scrollTop).toBe(mockElement.nativeElement.scrollHeight);

        expect(component['shouldScrollToBottom']).toBeFalse();
    });

    it('should toggle component visibility', () => {
        const initialVisibility = component.isComponentVisible;
        component.switchVisibility();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.isComponentVisible).toBe(!initialVisibility);

        component.switchVisibility();

        expect(component.isComponentVisible).toBe(initialVisibility);
    });

    it('should detach chat window when toggling window mode from integrated mode', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const detachSpy = spyOn<any>(component, 'detachToExternalWindow');
        component.isDetachedWindow = false;

        component.toggleWindowMode();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(detachSpy).toHaveBeenCalled();
    });

    it('should reattach chat window when toggling window mode from detached mode', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const reattachSpy = spyOn<any>(component, 'reattachToMainWindow');
        component.isDetachedWindow = true;

        component.toggleWindowMode();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(reattachSpy).toHaveBeenCalled();
    });
});
