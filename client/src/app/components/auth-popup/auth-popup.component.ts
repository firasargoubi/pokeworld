import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopupMessage } from '@app/consts/popup-message.const';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-auth-popup',
    templateUrl: './auth-popup.component.html',
    styleUrls: ['./auth-popup.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class AuthPopupComponent {
    username = '';
    password = '';
    isCreating = false;
    errorMessage = '';
    readonly clickValue = SoundEffect.Click;

    audioService: AudioService = inject(AudioService);
    private userService: UserService = inject(UserService);
    private popupService: PopupService = inject(PopupService);

    submit() {
        this.errorMessage = '';
        if (this.isCreating) {
            this.register();
        } else {
            this.login();
        }
    }

    register() {
        this.userService.createAccount(this.username, this.password).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.popupService.showPopup({
                    message: PopupMessage.SuccessfulAccountCreation,
                    hasCloseButton: true,
                    isConfirmation: false,
                });
            },
            error: () => (this.errorMessage = 'Erreur lors de la création du compte'),
        });
    }

    login() {
        this.userService.login(this.username, this.password).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.popupService.showPopup({
                    message: PopupMessage.SuccessfulConnection,
                    hasCloseButton: true,
                    isConfirmation: false,
                });
            },
            error: () => (this.errorMessage = 'Échec de la connexion'),
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
}
