import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppSettingsPopupComponent } from '@app/components/app-settings-popup/app-settings-popup.component';
import { AuthPopupComponent } from '@app/components/auth-popup/auth-popup.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';
import { UserPopupComponent } from '@app/components/user-popup/user-popup.component';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { UserService } from '@app/services/user/user.service';
import { DEFAULT_PREFERENCES } from '@common/interfaces/preferences';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { MenuPageComponent } from './menu-page.component';

@Component({ selector: 'app-settings-popup', standalone: true, template: '' })
class MockSettingsPopupComponent {}

@Component({ selector: 'app-auth-popup', standalone: true, template: '' })
class MockAuthPopupComponent {}

@Component({ selector: 'app-user-popup', standalone: true, template: '' })
class MockUserPopupComponent {}

@Component({ selector: 'app-chat', standalone: true, template: '' })
class MockChatComponent {}

@Component({ selector: 'app-menu-button', standalone: true, template: '' })
class MockMenuButtonComponent {}

describe('MenuPageComponent', () => {
    let component: MenuPageComponent;
    let fixture: ComponentFixture<MenuPageComponent>;
    let mockAudioService: jasmine.SpyObj<AudioService>;
    let mockPreferencesService: jasmine.SpyObj<PreferencesService>;
    let mockUserService: jasmine.SpyObj<UserService>;
    let userSubject: BehaviorSubject<UserInfo | null>;

    const mockUser: UserInfo = {
        userId: '123',
        username: 'TESTUSER',
        email: 'test@test.com',
        profilePicture: 'pic.png',
        fullProfilePicture: 'full.png',
        balance: 100,
        createdAt: new Date(),
        inventory: [],
        preferences: DEFAULT_PREFERENCES,
        challenges: [],
    };

    beforeEach(async () => {
        userSubject = new BehaviorSubject<UserInfo | null>(null);
        mockAudioService = jasmine.createSpyObj('AudioService', [
            'playBackgroundMusic',
            'playEffect',
            'setBackgroundMusicVolume',
            'setEffectsVolume',
            'stopBackgroundMusic',
        ]);
        mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['getHomeMenuTrack']);
        mockPreferencesService.getHomeMenuTrack.and.returnValue(BackgroundMusic.Home);
        mockUserService = jasmine.createSpyObj('UserService', [], {
            user$: userSubject.asObservable(),
        });

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), MenuPageComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: mockAudioService },
                { provide: PreferencesService, useValue: mockPreferencesService },
                { provide: UserService, useValue: mockUserService },
            ],
        }).compileComponents();

        TestBed.overrideComponent(MenuPageComponent, {
            add: {
                imports: [MockSettingsPopupComponent, MockAuthPopupComponent, MockUserPopupComponent, MockChatComponent, MockMenuButtonComponent],
            },
            remove: {
                imports: [
                    CommonModule,
                    MenuButtonComponent,
                    RouterModule,
                    AppSettingsPopupComponent,
                    AuthPopupComponent,
                    UserPopupComponent,
                    ChatComponent,
                ],
            },
        });

        fixture = TestBed.createComponent(MenuPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start menu audio when a user logs in', () => {
        userSubject.next(mockUser);

        expect(mockAudioService.playBackgroundMusic).toHaveBeenCalledWith(BackgroundMusic.Home);
        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalled();
        expect(mockAudioService.setEffectsVolume).toHaveBeenCalled();
    });

    it('should stop music and close popups when the user logs out', () => {
        userSubject.next(mockUser);
        component.isShopPopupVisible = true;
        component.isUserPopupVisible = true;

        userSubject.next(null);

        expect(component.isShopPopupVisible).toBeFalse();
        expect(component.isUserPopupVisible).toBeFalse();
        expect(mockAudioService.stopBackgroundMusic).toHaveBeenCalled();
    });

    it('should toggle audio settings and play click effect', () => {
        component.toggleAudioSettings();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.isAudioSettingsVisible).toBeTrue();
    });

    it('should not open the shop popup without an authenticated user', () => {
        component.toggleShopPopup();

        expect(component.isShopPopupVisible).toBeFalse();
        expect(mockAudioService.playEffect).not.toHaveBeenCalled();
    });

    it('should toggle shop popup and close user popup when authenticated', () => {
        component.currentUser = mockUser;
        component.isUserPopupVisible = true;

        component.toggleShopPopup();

        expect(component.isShopPopupVisible).toBeTrue();
        expect(component.isUserPopupVisible).toBeFalse();
        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
    });

    it('should toggle user popup and close shop popup', () => {
        component.currentUser = mockUser;
        component.isShopPopupVisible = true;

        component.toggleUserPopup();

        expect(component.isUserPopupVisible).toBeTrue();
        expect(component.isShopPopupVisible).toBeFalse();
        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
    });
});
