import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { UserService } from '@app/services/user/user.service';
import { AppLanguage } from '@common/interfaces/preferences';
import { TranslateModule } from '@ngx-translate/core';
import { AuthPopupComponent } from './auth-popup.component';

describe('AuthPopupComponent', () => {
    let component: AuthPopupComponent;
    let fixture: ComponentFixture<AuthPopupComponent>;
    let mockAudioService: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect']);
        const mockUserService = jasmine.createSpyObj('UserService', ['createAccount', 'login', 'setUser']);
        const mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup']);
        const mockChatService = jasmine.createSpyObj('ChatService', ['joinAllChannels']);
        const mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['setLanguageBeforeAuth', 'syncAfterLogin'], {
            currentLanguage: AppLanguage.French,
        });

        await TestBed.configureTestingModule({
            imports: [AuthPopupComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: mockAudioService },
                { provide: UserService, useValue: mockUserService },
                { provide: PopupService, useValue: mockPopupService },
                { provide: ChatService, useValue: mockChatService },
                { provide: PreferencesService, useValue: mockPreferencesService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AuthPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open avatar picker and play click sound', () => {
        const input = document.createElement('input');
        const clickSpy = spyOn(input, 'click');

        component.openAvatarPicker(input);

        expect(clickSpy).toHaveBeenCalled();
        expect(mockAudioService.playEffect).toHaveBeenCalledWith(component.clickValue);
    });

    it('should remove custom avatar and reset selection', () => {
        component.customAvatarDataUrl = 'data:image/jpeg;base64,abc';
        component.selectedAvatar = '__custom_avatar__';
        component.selectedFullAvatar = '__custom_avatar__';
        const event = new MouseEvent('click');
        const stopPropagationSpy = spyOn(event, 'stopPropagation');

        component.removeCustomAvatar(event);

        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(component.customAvatarDataUrl).toBe('');
        expect(component.selectedAvatar).toBe(component.avatarList[0]);
        expect(component.selectedFullAvatar).toBe(component.fullAvatarList[0]);
        expect(mockAudioService.playEffect).toHaveBeenCalledWith(component.clickValue);
    });

    it('should set invalid image error when uploaded file is not an image', async () => {
        const target = { files: [{ type: 'text/plain' }], value: 'has-value' } as unknown as HTMLInputElement;

        await component.onCustomAvatarUpload({ target } as unknown as Event);

        expect(component.errorMessage).toBe('components.authPopup.invalidImageFile');
        expect(target.value).toBe('');
    });

    it('should set image too large error when compression fails', async () => {
        const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
        const target = { files: [file], value: 'has-value' } as unknown as HTMLInputElement;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'compressImageToMaxSize').and.resolveTo(null);

        await component.onCustomAvatarUpload({ target } as unknown as Event);

        expect(component.errorMessage).toBe('components.authPopup.imageTooLarge');
        expect(target.value).toBe('');
    });

    it('should set custom avatar token and clear error on successful upload', async () => {
        const compressedAvatar = 'data:image/jpeg;base64,YQ==';
        const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
        const target = { files: [file], value: 'has-value' } as unknown as HTMLInputElement;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'compressImageToMaxSize').and.resolveTo(compressedAvatar);
        component.errorMessage = 'old-error';

        await component.onCustomAvatarUpload({ target } as unknown as Event);

        expect(component.customAvatarDataUrl).toBe(compressedAvatar);
        expect(component.selectedAvatar).toBe('__custom_avatar__');
        expect(component.selectedFullAvatar).toBe('__custom_avatar__');
        expect(component.errorMessage).toBe('');
        expect(target.value).toBe('');
    });

    it('should do nothing when upload event has no file', async () => {
        const target = { files: [], value: 'has-value' } as unknown as HTMLInputElement;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const compressSpy = spyOn<any>(component, 'compressImageToMaxSize');

        await component.onCustomAvatarUpload({ target } as unknown as Event);

        expect(compressSpy).not.toHaveBeenCalled();
        expect(target.value).toBe('has-value');
    });
});
