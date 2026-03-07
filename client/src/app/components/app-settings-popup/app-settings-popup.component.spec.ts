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

    const defaultMusicVolume = 0.5;

    beforeEach(async () => {
        mockAudioService = jasmine.createSpyObj('AudioService', [
            'playEffect',
            'setBackgroundMusicVolume',
            'setEffectsVolume',
            'getBackgroundMusicVolume',
            'getEffectsVolume',
        ]);
        mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['setTheme', 'setLanguage'], {
            currentTheme: AppTheme.Default,
            currentLanguage: AppLanguage.French,
        });

        mockAudioService.getBackgroundMusicVolume.and.returnValue(defaultMusicVolume);
        mockAudioService.getEffectsVolume.and.returnValue(defaultMusicVolume);

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

    it('should update music and effects volumes', () => {
        const percentageToDecimal = 0.01;
        const musicVolume = 75;
        const effectsVolume = 60;

        component.onVolumeChange(musicVolume, effectsVolume);

        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(musicVolume * percentageToDecimal);
        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(effectsVolume * percentageToDecimal);
    });

    it('should convert percentage to decimal', () => {
        const volume = 100;
        component.onVolumeChange(volume, 0);

        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(1);
        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(0);
    });

    it('should mute music when currently playing', () => {
        mockAudioService.getBackgroundMusicVolume.and.returnValue(defaultMusicVolume);

        component.onMuteMusic();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(0);
    });

    it('should unmute music when currently muted', () => {
        const percentageToDecimal = 0.01;
        const volume = 50;

        mockAudioService.getBackgroundMusicVolume.and.returnValue(0);
        component.onVolumeChange(volume, volume);
        mockAudioService.getBackgroundMusicVolume.and.returnValue(0);

        component.onMuteMusic();

        expect(mockAudioService.setBackgroundMusicVolume).toHaveBeenCalledWith(volume * percentageToDecimal);
    });

    it('should always play click sound', () => {
        component.onMuteMusic();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
    });

    it('should mute effects when currently playing', () => {
        const volume = 0.5;
        mockAudioService.getEffectsVolume.and.returnValue(volume);

        component.onMuteEffects();

        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(0);
    });

    it('should unmute effects when currently muted', () => {
        const percentageToDecimal = 0.01;
        const volume = 50;
        mockAudioService.getEffectsVolume.and.returnValue(0);
        component.onVolumeChange(volume, volume);
        mockAudioService.getEffectsVolume.and.returnValue(0);

        component.onMuteEffects();

        expect(mockAudioService.setEffectsVolume).toHaveBeenCalledWith(volume * percentageToDecimal);
    });

    it('should play click sound effect', () => {
        component.playClickSound();

        expect(mockAudioService.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
    });

    it('should set theme preference', () => {
        component.selectTheme(AppTheme.Dark);

        expect(mockPreferencesService.setTheme).toHaveBeenCalledWith(AppTheme.Dark);
    });

    it('should set language preference', () => {
        component.selectLanguage(AppLanguage.English);

        expect(mockPreferencesService.setLanguage).toHaveBeenCalledWith(AppLanguage.English);
    });
});
