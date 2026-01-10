import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AudioSettingsComponent } from '@app/components/audio-settings/audio-settings.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.scss'],
    imports: [MenuButtonComponent, RouterModule, AudioSettingsComponent, ChatComponent],
})
export class MenuPageComponent {
    pageEndpoint = PageEndpoint;
    readonly audioService: AudioService = inject(AudioService);
    readonly clickValue = SoundEffect.Click;
    isFirstTime = true;
    isAudioSettingsVisible = false;

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
}
