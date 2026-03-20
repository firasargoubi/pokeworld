import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SettingsTab } from '@app/interfaces/settings';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-settings-popup',
    templateUrl: './app-settings-popup.component.html',
    styleUrls: ['./app-settings-popup.component.scss'],
    imports: [CommonModule, TranslateModule],
    standalone: true,
})
export class AppSettingsPopupComponent {
    readonly audioService: AudioService = inject(AudioService);
    readonly preferencesService: PreferencesService = inject(PreferencesService);

    readonly appTheme = AppTheme;
    readonly appLanguage = AppLanguage;
    readonly settingsTab = SettingsTab;

    selectedTab: SettingsTab = this.settingsTab.Audio;

    private lastMusicVolume = this.audioService.getBackgroundMusicVolume();
    private lastEffectsVolume = this.audioService.getEffectsVolume();
    private lastAvatarsVolume = this.audioService.getAvatarsVolume();

    get currentTheme(): AppTheme {
        return this.preferencesService.currentTheme;
    }

    get currentLanguage(): AppLanguage {
        return this.preferencesService.currentLanguage;
    }

    selectTab(tab: SettingsTab): void {
        this.playClickSound();
        this.selectedTab = tab;
    }

    onVolumeChange(music: number, effects: number, avatars: number): void {
        const factor = 100;
        this.lastMusicVolume = music / factor;
        this.lastEffectsVolume = effects / factor;
        this.lastAvatarsVolume = avatars / factor;
        this.audioService.setBackgroundMusicVolume(this.lastMusicVolume);
        this.audioService.setEffectsVolume(this.lastEffectsVolume);
        this.audioService.setAvatarsVolume(this.lastAvatarsVolume);
    }

    onMuteMusic(): void {
        this.playClickSound();
        const bg = this.audioService.getBackgroundMusicVolume() === 0 ? this.lastMusicVolume : 0;
        this.audioService.setBackgroundMusicVolume(bg);
    }

    onMuteEffects(): void {
        this.playClickSound();
        const fx = this.audioService.getEffectsVolume() === 0 ? this.lastEffectsVolume : 0;
        this.audioService.setEffectsVolume(fx);
    }

    onMuteAvatars(): void {
        this.playClickSound();
        const av = this.audioService.getAvatarsVolume() === 0 ? this.lastAvatarsVolume : 0;
        this.audioService.setAvatarsVolume(av);
    }

    playClickSound(): void {
        this.audioService.playEffect(SoundEffect.Click);
    }

    selectTheme(theme: AppTheme): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.preferencesService.setTheme(theme);
    }

    selectLanguage(language: AppLanguage): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.preferencesService.setLanguage(language);
    }
}
