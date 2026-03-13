import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, HostListener, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_LIST, FULL_AVATAR_LIST } from '@app/consts/avatar-list.const';
import { DEFAULT_CHARACTER_VISUAL_DATA } from '@app/consts/player-data.const';
import { PopupMessage } from '@app/consts/popup-message.const';
import { CharacterVisualData } from '@app/interfaces/character-visual-data';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { UserService } from '@app/services/user/user.service';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@common/consts/player-data.const';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-auth-popup',
    templateUrl: './auth-popup.component.html',
    styleUrls: ['./auth-popup.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
})
export class AuthPopupComponent {
    usernameForm: FormControl = new FormControl('', [
        Validators.required,
        Validators.minLength(MIN_NAME_LENGTH),
        Validators.maxLength(MAX_NAME_LENGTH),
    ]);
    visualData: CharacterVisualData = structuredClone(DEFAULT_CHARACTER_VISUAL_DATA);
    password = '';
    confirmPassword = '';
    emailForm: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9\-.]+)\.([a-zA-Z]{2,})$/),
    ]);
    isCreating = false;
    errorMessage = '';
    readonly clickValue = SoundEffect.Click;

    appLanguage = AppLanguage;

    avatarList: string[] = structuredClone(AVATAR_LIST);
    selectedAvatar: string = this.avatarList[0];
    avatarUrl: string = '';
    fullAvatarList: string[] = structuredClone(FULL_AVATAR_LIST);
    selectedFullAvatar: string = this.fullAvatarList[0];
    fullAvatarUrl: string = '';

    audioService: AudioService = inject(AudioService);
    private userService: UserService = inject(UserService);
    private popupService: PopupService = inject(PopupService);
    private chatService: ChatService = inject(ChatService);
    private preferencesService: PreferencesService = inject(PreferencesService);

    get selectedLanguage(): AppLanguage {
        return this.preferencesService.currentLanguage;
    }

    @HostListener('document:keydown.enter', ['$event'])
    onEnterKey(event: Event) {
        event.preventDefault();
        this.primaryAction();
    }

    onUsernameInput(): void {
        const normalizedUsername = String(this.usernameForm.value || '').toUpperCase();
        if (this.usernameForm.value !== normalizedUsername) {
            this.usernameForm.setValue(normalizedUsername, { emitEvent: false });
        }
    }

    async getAvatarDataUrl(imagePath: string): Promise<string> {
        if (!imagePath) return '';
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imagePath;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    resolve('');
                }
            };
            img.onerror = () => resolve('');
        });
    }

    async submit() {
        this.errorMessage = '';
        if (
            !this.password.trim() ||
            !this.usernameForm.value.trim() ||
            (this.isCreating && (!this.emailForm.value.trim() || !this.confirmPassword.trim()))
        ) {
            this.errorMessage = PopupMessage.EmptyFields;
            return;
        } else if (this.usernameForm.value.trim().length !== this.usernameForm.value.length) {
            this.errorMessage = PopupMessage.UsernameSpaces;
            return;
        } else if (!this.usernameForm.valid) {
            this.errorMessage = PopupMessage.UsernameLength;
            return;
        } else if (this.isCreating && this.password !== this.confirmPassword) {
            this.errorMessage = 'components.authPopup.passwordMismatch';
            return;
        } else if (this.isCreating && !this.emailForm.valid) {
            this.errorMessage = 'components.authPopup.invalidEmail';
            return;
        }
        if (this.isCreating) {
            this.popupService.showPopup({
                message: 'components.authPopup.confirmAccountCreation',
                hasCloseButton: true,
                isConfirmation: true,
                action: () => void this.register(),
            });
        } else {
            this.login();
        }
    }

    async register() {
        this.avatarUrl = await this.getAvatarDataUrl(this.selectedAvatar);
        this.fullAvatarUrl = await this.getAvatarDataUrl(this.selectedFullAvatar);
        this.userService
            .createAccount(
                {
                    username: this.usernameForm.value.toUpperCase().trim(),
                    password: this.password,
                    profilePicture: this.avatarUrl,
                    fullProfilePicture: this.fullAvatarUrl || this.avatarUrl,
                    email: this.emailForm.value.trim(),
                },
                {
                    language: this.selectedLanguage,
                    theme: AppTheme.Default,
                },
            )
            .subscribe({
                next: (user) => {
                    this.userService.setUser(user);
                    this.preferencesService.syncAfterLogin(user.userId, user.preferences);
                    this.popupService.showPopup({
                        message: PopupMessage.SuccessfulAccountCreation,
                        hasCloseButton: true,
                        isConfirmation: false,
                    });
                },
                error: (error: HttpErrorResponse) => {
                    this.handleNotFoundError(error, true);
                },
            });
    }

    selectAvatar(avatar: string) {
        this.selectedAvatar = avatar;
        const selectedIndex = this.avatarList.indexOf(avatar);
        const normalizedIndex = selectedIndex >= 0 ? selectedIndex : 0;
        this.selectedFullAvatar = this.fullAvatarList[normalizedIndex] ?? this.fullAvatarList[0];
        this.audioService.playEffect(this.clickValue);
    }

    login() {
        this.userService.login(this.usernameForm.value.toUpperCase().trim(), this.password).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.preferencesService.syncAfterLogin(user.userId, user.preferences);
                this.popupService.showPopup({
                    message: PopupMessage.SuccessfulConnection,
                    hasCloseButton: true,
                    isConfirmation: false,
                });
                this.chatService.joinAllChannels();
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error, false);
            },
        });
    }

    primaryAction() {
        this.audioService.playEffect(this.clickValue);
        this.submit();
    }

    toggleAction() {
        this.audioService.playEffect(this.clickValue);
        this.toggleMode();
    }

    toggleMode() {
        this.isCreating = !this.isCreating;
        this.errorMessage = '';
        this.confirmPassword = '';
    }

    selectLanguage(language: AppLanguage): void {
        this.audioService.playEffect(this.clickValue);
        this.preferencesService.setLanguageBeforeAuth(language);
    }

    private handleNotFoundError(error: HttpErrorResponse, isRegister: boolean) {
        if (error.status === HttpStatusCode.NotFound) {
            this.errorMessage = PopupMessage.InvalidCredentials;
        } else if (error.status === HttpStatusCode.Conflict) {
            if (isRegister) this.errorMessage = PopupMessage.UsernameTaken;
            else this.errorMessage = PopupMessage.AccountConnected;
        }
    }
}
