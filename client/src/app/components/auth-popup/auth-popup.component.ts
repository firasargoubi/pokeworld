import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEFAULT_CHARACTER_VISUAL_DATA } from '@app/consts/player-data.const';
import { PopupMessage } from '@app/consts/popup-message.const';
import { CharacterVisualData } from '@app/interfaces/character-visual-data';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@common/consts/player-data.const';

@Component({
    selector: 'app-auth-popup',
    templateUrl: './auth-popup.component.html',
    styleUrls: ['./auth-popup.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AuthPopupComponent {
    usernameForm: FormControl = new FormControl('', [
        Validators.required,
        Validators.minLength(MIN_NAME_LENGTH),
        Validators.maxLength(MAX_NAME_LENGTH),
    ]);
    visualData: CharacterVisualData = structuredClone(DEFAULT_CHARACTER_VISUAL_DATA);
    password = '';
    isCreating = false;
    errorMessage = '';
    readonly clickValue = SoundEffect.Click;

    audioService: AudioService = inject(AudioService);
    private userService: UserService = inject(UserService);
    private popupService: PopupService = inject(PopupService);

    submit() {
        this.errorMessage = '';
        if (!this.password.trim() || !this.usernameForm.value.trim()) {
            this.errorMessage = PopupMessage.EmptyFields;
            return;
        } else if (this.usernameForm.value.trim().length !== this.usernameForm.value.length) {
            this.errorMessage = PopupMessage.UsernameSpaces;
            return;
        } else if (!this.usernameForm.valid) {
            this.errorMessage = PopupMessage.UsernameLength;
            return;
        }
        if (this.isCreating) {
            this.register();
        } else {
            this.login();
        }
    }

    register() {
        this.userService.createAccount(this.usernameForm.value.toUpperCase().trim(), this.password).subscribe({
            next: (user) => {
                this.userService.setUser(user);
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

    login() {
        this.userService.login(this.usernameForm.value.toUpperCase().trim(), this.password).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.popupService.showPopup({
                    message: PopupMessage.SuccessfulConnection,
                    hasCloseButton: true,
                    isConfirmation: false,
                });
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
