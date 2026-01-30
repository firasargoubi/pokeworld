import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AudioSettingsComponent } from '@app/components/audio-settings/audio-settings.component';
import { AuthPopupComponent } from '@app/components/auth-popup/auth-popup.component';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';
import { UserPopupComponent } from '@app/components/user-popup/user-popup.component';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { UserService } from '@app/services/user/user.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { UserInfo } from '@common/interfaces/user';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.scss'],
    imports: [CommonModule, MenuButtonComponent, RouterModule, AudioSettingsComponent, AuthPopupComponent, UserPopupComponent],
})
export class MenuPageComponent {
    pageEndpoint = PageEndpoint;
    readonly audioService: AudioService = inject(AudioService);
    readonly userService: UserService = inject(UserService);
    readonly clickValue = SoundEffect.Click;
    isFirstTime = true;
    isAudioSettingsVisible = false;
    isUserPopupVisible = false;
    currentUser: UserInfo | null = null;

    constructor() {
        this.userService.user$.subscribe((u) => {
            this.currentUser = u;
            if (!u) {
                this.isUserPopupVisible = false;
            }
        });
    }

    onMouseDown() {
        if (this.isFirstTime) {
            this.audioService.playBackgroundMusic(BackgroundMusic.Home);
            this.audioService.setBackgroundMusicVolume();
            this.audioService.setEffectsVolume();
            this.isFirstTime = false;
        }
    }

    toggleAudioSettings() {
        this.audioService.playEffect(this.clickValue);
        this.isAudioSettingsVisible = !this.isAudioSettingsVisible;
    }

    toggleUserPopup() {
        this.audioService.playEffect(this.clickValue);
        this.isUserPopupVisible = !this.isUserPopupVisible;
    }
}
