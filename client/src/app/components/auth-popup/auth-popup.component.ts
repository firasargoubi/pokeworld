import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, HostListener, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_LIST, FULL_AVATAR_LIST } from '@app/consts/avatar-list.const';
import { DEFAULT_CHARACTER_VISUAL_DATA } from '@app/consts/player-data.const';
import { PopupMessage } from '@app/consts/popup-message.const';
import { CharacterVisualData } from '@app/interfaces/character-visual-data';
import { PopupColor } from '@app/interfaces/popup';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { UserService } from '@app/services/user/user.service';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@common/consts/player-data.const';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';
import { TranslateModule } from '@ngx-translate/core';
import imageCompression from 'browser-image-compression';

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
    customAvatarDataUrl: string = '';

    audioService: AudioService = inject(AudioService);
    private userService: UserService = inject(UserService);
    private popupService: PopupService = inject(PopupService);
    private chatService: ChatService = inject(ChatService);
    private preferencesService: PreferencesService = inject(PreferencesService);

    private readonly customAvatarToken = '__custom_avatar__';
    private readonly maxAvatarSizeBytes = 1000000;
    private readonly maxAvatarDimension = 1024;
    private readonly bytesPerKilobyte = 1024;
    private readonly base64BytesPerBlock = 3;
    private readonly base64CharsPerBlock = 4;

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
        const isCustomAvatarSelected = this.selectedAvatar === this.customAvatarToken && !!this.customAvatarDataUrl;
        this.avatarUrl = isCustomAvatarSelected ? this.customAvatarDataUrl : await this.getAvatarDataUrl(this.selectedAvatar);
        this.fullAvatarUrl = isCustomAvatarSelected ? this.customAvatarDataUrl : await this.getAvatarDataUrl(this.selectedFullAvatar);
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
                        popupColor: PopupColor.Green,
                    });
                },
                error: (error: HttpErrorResponse) => {
                    this.handleNotFoundError(error, true);
                },
            });
    }

    selectAvatar(avatar: string) {
        this.selectedAvatar = avatar;
        this.customAvatarDataUrl = '';
        const selectedIndex = this.avatarList.indexOf(avatar);
        const normalizedIndex = selectedIndex >= 0 ? selectedIndex : 0;
        this.selectedFullAvatar = this.fullAvatarList[normalizedIndex] ?? this.fullAvatarList[0];
        this.audioService.playEffect(this.clickValue);
    }

    openAvatarPicker(input: HTMLInputElement) {
        this.audioService.playEffect(this.clickValue);
        input.click();
    }

    removeCustomAvatar(event: Event) {
        event.stopPropagation();
        this.audioService.playEffect(this.clickValue);
        this.customAvatarDataUrl = '';
        this.selectedAvatar = this.avatarList[0];
        this.selectedFullAvatar = this.fullAvatarList[0] ?? this.fullAvatarList[0];
    }

    async onCustomAvatarUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.errorMessage = 'components.authPopup.invalidImageFile';
            target.value = '';
            return;
        }

        const compressedAvatar = await this.compressImageToMaxSize(file, this.maxAvatarSizeBytes);
        if (!compressedAvatar) {
            this.errorMessage = 'components.authPopup.imageTooLarge';
            target.value = '';
            return;
        }

        this.customAvatarDataUrl = compressedAvatar;
        this.selectedAvatar = this.customAvatarToken;
        this.selectedFullAvatar = this.customAvatarToken;
        this.errorMessage = '';
        target.value = '';
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
                    popupColor: PopupColor.Green,
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

    private async compressImageToMaxSize(file: File, maxBytes: number): Promise<string | null> {
        try {
            const compressedFile = await imageCompression(file, {
                maxSizeMB: maxBytes / (this.bytesPerKilobyte * this.bytesPerKilobyte),
                maxWidthOrHeight: this.maxAvatarDimension,
                useWebWorker: true,
                initialQuality: 0.85,
                alwaysKeepResolution: false,
                fileType: 'image/jpeg',
            });
            const compressedDataUrl = await imageCompression.getDataUrlFromFile(compressedFile);
            if (this.dataUrlSizeInBytes(compressedDataUrl) > maxBytes) {
                return null;
            }

            return compressedDataUrl;
        } catch {
            return null;
        }
    }

    private dataUrlSizeInBytes(dataUrl: string): number {
        const base64Data = dataUrl.split(',')[1] ?? '';
        const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0;
        return Math.floor((base64Data.length * this.base64BytesPerBlock) / this.base64CharsPerBlock) - padding;
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
