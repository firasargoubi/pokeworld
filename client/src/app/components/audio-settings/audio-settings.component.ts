import { Component } from '@angular/core';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';

@Component({
    selector: 'app-audio-settings',
    templateUrl: './audio-settings.component.html',
    styleUrls: ['./audio-settings.component.scss'],
    imports: [],
    standalone: true,
})
export class AudioSettingsComponent {
    private lastMusicVolume = this.audioService.getBackgroundMusicVolume();
    private lastEffectsVolume = this.audioService.getEffectsVolume();

    constructor(readonly audioService: AudioService) {}

    onVolumeChange(music: number, effects: number): void {
        const factor = 100;
        this.lastMusicVolume = music / factor;
        this.lastEffectsVolume = effects / factor;
        this.audioService.setBackgroundMusicVolume(this.lastMusicVolume);
        this.audioService.setEffectsVolume(this.lastEffectsVolume);
    }

    onMuteMusic(): void {
        this.playClickSound();
        const bg = this.audioService.getBackgroundMusicVolume() === 0 ? this.lastMusicVolume : 0;
        this.audioService.setBackgroundMusicVolume(bg);
    }

    onMuteEffects(): void {
        const fx = this.audioService.getEffectsVolume() === 0 ? this.lastEffectsVolume : 0;
        this.audioService.setEffectsVolume(fx);
    }

    playClickSound(): void {
        this.audioService.playEffect(SoundEffect.Click);
    }
}
