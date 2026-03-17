import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';
import { TranslateModule } from '@ngx-translate/core';
import { AppSettingsPopupComponent } from './app-settings-popup.component';

describe('AppSettingsPopupComponent', () => {
    let component: AppSettingsPopupComponent;
    let fixture: ComponentFixture<AppSettingsPopupComponent>;
    let mockAudioService: jasmine.SpyObj<AudioService>;
    let mockPreferencesService: jasmine.SpyObj<PreferencesService>;

    const defaultVolume = 0.5;

    beforeEach(async () => {
        mockAudioService = jasmine.createSpyObj('AudioService', [
            'playEffect',
            'setBackgroundMusicVolume',
            'setEffectsVolume',
            'setAvatarsVolume',
            'getBackgroundMusicVolume',
            'getEffectsVolume',
            'getAvatarsVolume',
        ]);
        mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['setTheme', 'setLanguage'], {
            currentTheme: AppTheme.Default,
            currentLanguage: AppLanguage.French,
        });

        mockAudioService.getBackgroundMusicVolume.and.returnValue(defaultVolume);
        mockAudioService.getEffectsVolume.and.returnValue(defaultVolume);
        mockAudioService.getAvatarsVolume.and.returnValue(defaultVolume);

        await TestBed.configureTestingModule({
            imports: [AppSettingsPopupComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: mockAudioService },
                { provide: PreferencesService, useValue: mockPreferencesService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppSettingsPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should expose current theme and language from preferences service', () => {
        expect(component.currentTheme).toBe(AppTheme.Default);
        expect(component.currentLanguage).toBe(AppLanguage.French);
    });

    it('should update music, effects and avatars volumes', () => {
        const percentageToDecimal = 0.01;
        const musicVolume = 75;
        const effectsVolume = 60;
        const avatarsVolume = 40;

        component.onVolumeChange(musicVolume, effectsVolume, avatarsVolume);

        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(musicVolume * percentageToDecimal);
        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(effectsVolume * percentageToDecimal);
        expect(mockAudioService.setAvatarsVolume).toHaveBeenCalledWith(avatarsVolume * percentageToDecimal);
    });

    it('should convert percentage to decimal', () => {
        const musicVolume = 100;
        component.onVolumeChange(musicVolume, 0, 0);

        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(1);
        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(0);
        expect(mockAudioService.setAvatarsVolume).toHaveBeenCalledWith(0);
    });

    it('should mute music when currently playing', () => {
        mockAudioService.getBackgroundMusicVolume.and.returnValue(defaultVolume);

        component.onMuteMusic();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(0);
    });

    it('should unmute music when currently muted', () => {
        const percentageToDecimal = 0.01;
        const volume = 50;

        component.onVolumeChange(volume, volume, volume);
        mockAudioService.getBackgroundMusicVolume.and.returnValue(0);

        component.onMuteMusic();

        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(volume * percentageToDecimal);
    });

    it('should mute effects when currently playing', () => {
        mockAudioService.getEffectsVolume.and.returnValue(defaultVolume);

        component.onMuteEffects();

        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(0);
    });

    it('should unmute effects when currently muted', () => {
        const percentageToDecimal = 0.01;
        const volume = 50;

        component.onVolumeChange(volume, volume, volume);
        mockAudioService.getEffectsVolume.and.returnValue(0);

        component.onMuteEffects();

        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(volume * percentageToDecimal);
    });

    it('should mute avatars when currently playing', () => {
        mockAudioService.getAvatarsVolume.and.returnValue(defaultVolume);

        component.onMuteAvatars();

        expect(mockAudioService.setAvatarsVolume).toHaveBeenCalledWith(0);
    });

    it('should unmute avatars when currently muted', () => {
        const percentageToDecimal = 0.01;
        const volume = 50;

        component.onVolumeChange(volume, volume, volume);
        mockAudioService.getAvatarsVolume.and.returnValue(0);

        component.onMuteAvatars();

        expect(mockAudioService.setAvatarsVolume).toHaveBeenCalledWith(volume * percentageToDecimal);
    });

    it('should play click sound effect', () => {
        component.playClickSound();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
    });

    it('should set theme preference and play click sound', () => {
        component.selectTheme(AppTheme.Dark);

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(mockPreferencesService.setTheme).toHaveBeenCalledWith(AppTheme.Dark);
    });

    it('should set language preference and play click sound', () => {
        component.selectLanguage(AppLanguage.English);

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(mockPreferencesService.setLanguage).toHaveBeenCalledWith(AppLanguage.English);
    });
});
