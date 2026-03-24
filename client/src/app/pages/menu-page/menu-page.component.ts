import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppSettingsPopupComponent } from '@app/components/app-settings-popup/app-settings-popup.component';
import { AuthPopupComponent } from '@app/components/auth-popup/auth-popup.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';
import { ShopPopupComponent } from '@app/components/shop-popup/shop-popup.component';
import { UserPopupComponent } from '@app/components/user-popup/user-popup.component';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { UserService } from '@app/services/user/user.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.scss'],
    imports: [
        CommonModule,
        MenuButtonComponent,
        RouterModule,
        AppSettingsPopupComponent,
        AuthPopupComponent,
        ShopPopupComponent,
        UserPopupComponent,
        ChatComponent,
        TranslateModule,
    ],
})
export class MenuPageComponent {
    pageEndpoint = PageEndpoint;
    readonly audioService: AudioService = inject(AudioService);
    readonly userService: UserService = inject(UserService);
    readonly clickValue = SoundEffect.Click;
    isFirstTime = true;
    isAudioSettingsVisible = false;
    isShopPopupVisible = false;
    isUserPopupVisible = false;
    currentUser: UserInfo | null = null;

    constructor() {
        this.userService.user$.subscribe((u) => {
            this.currentUser = u;
            if (!u) {
                this.isShopPopupVisible = false;
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

    toggleShopPopup() {
        if (!this.currentUser) {
            return;
        }
        this.audioService.playEffect(this.clickValue);
        if (!this.isShopPopupVisible) {
            this.isUserPopupVisible = false;
        }
        this.isShopPopupVisible = !this.isShopPopupVisible;
    }

    toggleUserPopup() {
        this.audioService.playEffect(this.clickValue);
        if (!this.isUserPopupVisible) {
            this.isShopPopupVisible = false;
        }
        this.isUserPopupVisible = !this.isUserPopupVisible;
    }
}
