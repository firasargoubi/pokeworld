import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PopupMessage } from '@app/consts/popup-message.const';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';
import { Avatar } from '@common/interfaces/player-data';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CharacterPageComponent } from './character-page.component';

@Component({
    selector: 'app-chat',
    standalone: true,
    template: '',
})
class MockChatComponent {}

describe('CharacterPageComponent', () => {
    let component: CharacterPageComponent;
    let fixture: ComponentFixture<CharacterPageComponent>;
    let mockMatchService: jasmine.SpyObj<MatchService>;
    let mockPopupService: jasmine.SpyObj<PopupService>;
    let mockLobbyService: jasmine.SpyObj<LobbyService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockAudioService: jasmine.SpyObj<AudioService>;
    let mockUserService: jasmine.SpyObj<UserService>;
    let mockChatService: jasmine.SpyObj<ChatService>;
    const mockUser = {
        userId: 'user-1',
        username: 'TEST-USER',
        email: 'user@test.com',
        profilePicture: 'pic.png',
        fullProfilePicture: 'full-pic.png',
        balance: 100,
        inventory: [],
        createdAt: new Date(),
        preferences: {
            language: 'fr',
            theme: 'default',
            partyBall: '0',
            menuMusic: '0',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    beforeEach(async () => {
        mockMatchService = jasmine.createSpyObj(
            'MatchService',
            ['isInMatch', 'leaveMatch', 'selfPlayer', 'selfIndex', 'matchUpdate', 'getLockedAvatars'],
            {
                data: structuredClone(MOCK_MATCH_DATAS[0]),
                selfPlayer: structuredClone(MOCK_PLAYER_DATAS[0]),
                matchUpdate: { pipe: () => ({ subscribe: () => ({}) }) },
            },
        );
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'preloadEffectsForPage']);
        mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup']);
        mockLobbyService = jasmine.createSpyObj('LobbyService', ['joinLobby', 'changeAvatar']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockUserService = jasmine.createSpyObj('UserService', ['getUserById', 'setUser'], {
            user$: of(mockUser),
            currentUser: mockUser,
        });
        mockUserService.getUserById.and.returnValue(of(mockUser));
        mockChatService = jasmine.createSpyObj('ChatService', ['isComponentVisible']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, CharacterPageComponent, TranslateModule.forRoot()],
            providers: [
                { provide: MatchService, useValue: mockMatchService },
                { provide: PopupService, useValue: mockPopupService },
                { provide: LobbyService, useValue: mockLobbyService },
                { provide: Router, useValue: mockRouter },
                { provide: AudioService, useValue: mockAudioService },
                { provide: UserService, useValue: mockUserService },
                { provide: ChatService, useValue: mockChatService },
            ],
        }).compileComponents();

        TestBed.overrideComponent(CharacterPageComponent, {
            add: { imports: [MockChatComponent] },
            remove: { imports: [ChatComponent] },
        });

        fixture = TestBed.createComponent(CharacterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update avatar list on construction', () => {
        fixture.destroy();
        mockMatchService.isInMatch.and.returnValue(true);
        mockMatchService.getLockedAvatars.and.returnValue([]);
        fixture = TestBed.createComponent(CharacterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should refresh the current user on construction', () => {
        expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.userId);
        expect(mockUserService.setUser).toHaveBeenCalledWith(mockUser);
    });

    it('should show popup with confirmation and bind leaveMatch', () => {
        component.goToMenu();
        expect(mockPopupService.showPopup).toHaveBeenCalled();
    });

    it('should toggle is attack selected', () => {
        component.visualData.isAttackSelected = true;
        component.toggleBonusDice();
        expect(component.visualData.isAttackSelected).toBeFalse();
    });

    it('should get player data correctly', () => {
        component.visualData.isHpSelected = false;
        component.visualData.isAttackSelected = false;
        component['getPlayerData']();
        expect(component.visualData.isAttackSelected).toBeFalse();
    });

    it('should call lobbyService.changeAvatar if avatar is not locked', () => {
        mockMatchService.getLockedAvatars.and.returnValue([Avatar.Avatar1, Avatar.Avatar2]);
        component.changeAvatar(Avatar.Avatar7);
        expect(mockLobbyService.changeAvatar).toHaveBeenCalledWith(Avatar.Avatar7);
    });

    it('should show popup with confirmation and bind leaveMatch action correctly', () => {
        mockPopupService.showPopup.and.callFake((popupMessage) => {
            const capturedPopupMessage = popupMessage;

            expect(capturedPopupMessage.message).toBe(PopupMessage.Quit);
            expect(capturedPopupMessage.hasCloseButton).toBeTrue();
            expect(capturedPopupMessage.isConfirmation).toBeTrue();
            expect(capturedPopupMessage.action).toBeDefined();

            capturedPopupMessage.action?.();
            expect(mockMatchService.leaveMatch).toHaveBeenCalled();
        });

        component.goToMenu();

        expect(mockPopupService.showPopup).toHaveBeenCalled();
    });

    it('should call joinLobby when Enter key is pressed and chat is not visible', () => {
        spyOn(component, 'joinLobby');
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        mockChatService.isComponentVisible.and.returnValue(false);
        component.onKeyDown(enterEvent);
        expect(component.joinLobby).toHaveBeenCalled();
    });

    it('should not call joinLobby when Enter key is pressed and chat is visible', () => {
        spyOn(component, 'joinLobby');
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        mockChatService.isComponentVisible.and.returnValue(true);
        component.onKeyDown(enterEvent);
        expect(component.joinLobby).not.toHaveBeenCalled();
    });
});
