import { TestBed } from '@angular/core/testing';
import { ChatTab } from '@app/interfaces/chat-tab.enum';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { MOCK_USER_INFO } from '@common/test-consts/mock-user-info';
import { UserInfo } from '@common/interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let mockMatchService: jasmine.SpyObj<MatchService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockUserService: jasmine.SpyObj<UserService>;
    let mockPopupService: jasmine.SpyObj<PopupService>;
    let userSubject: BehaviorSubject<UserInfo | null>;

    beforeEach(() => {
        mockMatchService = jasmine.createSpyObj('MatchService', ['isInMatch'], {
            selfPlayer: { name: 'TestUser' },
        });

        mockSocketService = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup']);
        userSubject = new BehaviorSubject<UserInfo | null>({ userId: 'u-1', username: 'TestUser' } as UserInfo);

        mockUserService = jasmine.createSpyObj('UserService', [], {
            user$: userSubject.asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: MatchService, useValue: mockMatchService },
                { provide: SocketService, useValue: mockSocketService },
                { provide: UserService, useValue: mockUserService },
                { provide: PopupService, useValue: mockPopupService },
            ],
        });

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a message', () => {
        const message = 'Hello, world!';
        service['user'] = MOCK_USER_INFO[0];
        service.chatState.set({ activeTab: ChatTab.General, isInChannelList: true, activeChannelName: undefined, activeMatchCode: undefined });

        mockSocketService.emit.and.callFake(async () => Promise.resolve(false));
        service.sendMessage(message);
        expect(mockSocketService.emit).toHaveBeenCalled();
    });

    it('should close detached window when user disconnects', () => {
        const popup = jasmine.createSpyObj<Window>('Window', ['close'], { closed: false });
        service.detachedWindow = popup;
        service.isWindowDetached.set(true);

        userSubject.next(null);

        expect(popup.close).toHaveBeenCalled();
        expect(service.detachedWindow).toBeNull();
        expect(service.isWindowDetached()).toBeFalse();
    });
});
