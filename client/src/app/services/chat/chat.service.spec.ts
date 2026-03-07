import { TestBed } from '@angular/core/testing';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let mockMatchService: jasmine.SpyObj<MatchService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockUserService: jasmine.SpyObj<UserService>;
    let mockPopupService: jasmine.SpyObj<PopupService>;

    beforeEach(() => {
        mockMatchService = jasmine.createSpyObj('MatchService', ['isInMatch'], {
            selfPlayer: { name: 'TestUser' },
        });

        mockSocketService = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup']);

        mockUserService = jasmine.createSpyObj('UserService', [], {
            user$: {
                subscribe: () => undefined,
            },
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
        mockSocketService.emit.and.callFake(async () => Promise.resolve(false));
        service.sendMessage(message);
        expect(mockSocketService.emit).toHaveBeenCalled();
    });
});
