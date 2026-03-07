import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSettingsPopupComponent } from '@app/components/app-settings-popup/app-settings-popup.component';
import { AuthPopupComponent } from '@app/components/auth-popup/auth-popup.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';
import { UserPopupComponent } from '@app/components/user-popup/user-popup.component';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { UserService } from '@app/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
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
    let mockUserService: jasmine.SpyObj<UserService>;

    beforeEach(async () => {
        mockAudioService = jasmine.createSpyObj('AudioService', [
            'playBackgroundMusic',
            'playEffect',
            'setBackgroundMusicVolume',
            'setEffectsVolume',
        ]);

        mockUserService = jasmine.createSpyObj('UserService', [], {
            user$: {
                subscribe: () => undefined,
            },
        });

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), MenuPageComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: mockAudioService },
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

    it('should play background music on first mousedown', () => {
        component.onMouseDown();

        expect(mockAudioService.playBackgroundMusic).toHaveBeenCalledWith(BackgroundMusic.Home);
        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalled();
        expect(mockAudioService.setEffectsVolume).toHaveBeenCalled();
        expect(component.isFirstTime).toBeFalse();
    });

    it('should not replay music if already started', () => {
        component.isFirstTime = false;
        mockAudioService.playBackgroundMusic.calls.reset();

        component.onMouseDown();

        expect(mockAudioService.playBackgroundMusic).not.toHaveBeenCalled();
        expect(component.isFirstTime).toBeFalse();
    });

    it('should toggle audio settings and play click effect', () => {
        component.toggleAudioSettings();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.isAudioSettingsVisible).toBeTrue();
    });

    it('should have correct initial values', () => {
        expect(component.isFirstTime).toBeTrue();
        expect(component.clickValue).toBe(SoundEffect.Click);
        expect(component.isAudioSettingsVisible).toBeFalse();
    });
});
