import { TestBed } from '@angular/core/testing';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { MatchData } from '@common/interfaces/match-data';
import { AUDIO_CONFIG, AUDIO_STORAGE_KEY, COMBAT_LOG_PATTERNS, SOUND_EFFECTS_MAP } from './audio.const';
import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;
    let audioElementSpy: jasmine.SpyObj<HTMLAudioElement>;
    let effectAudioSpy: jasmine.SpyObj<HTMLAudioElement>;
    let getItemSpy: jasmine.Spy<(key: string) => string | null>;
    let setItemSpy: jasmine.Spy<(key: string, value: string) => void>;

    beforeEach(() => {
        audioElementSpy = jasmine.createSpyObj('HTMLAudioElement', ['play', 'pause', 'load']);
        audioElementSpy.volume = 0;
        audioElementSpy.currentTime = 0;
        Object.defineProperty(audioElementSpy, 'paused', {
            get: () => false,
            configurable: true,
        });
        Object.defineProperty(audioElementSpy, 'loop', {
            value: false,
            writable: true,
        });
        audioElementSpy.play = jasmine.createSpy('play').and.returnValue(Promise.resolve());

        effectAudioSpy = jasmine.createSpyObj('HTMLAudioElement', ['play', 'load']);
        effectAudioSpy.volume = 0;
        effectAudioSpy.currentTime = 0;
        effectAudioSpy.play = jasmine.createSpy('play').and.returnValue(Promise.resolve());

        spyOn(window, 'Audio').and.returnValue(audioElementSpy);
        getItemSpy = spyOn(window.localStorage, 'getItem').and.returnValue(null);
        setItemSpy = spyOn(window.localStorage, 'setItem').and.stub();

        TestBed.configureTestingModule({ providers: [AudioService] });
        service = TestBed.inject(AudioService);

        service['backgroundMusic'] = null;
        service['effects'] = new Map<SoundEffect, HTMLAudioElement>();
        service['currentTrack'] = null;
        service['previousLogSize'] = 0;

        audioElementSpy.load.calls.reset();
        (window.Audio as unknown as jasmine.Spy).calls.reset();
        setItemSpy.calls.reset();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize properties correctly', () => {
        expect(service['backgroundMusic']).toBeNull();
        expect(service['effects']).toBeDefined();
        expect(service['effects'].size).toBe(0);
        expect(service['currentTrack']).toBeNull();
        expect(service['previousLogSize']).toBe(0);
    });

    it('should preload click effect in constructor', () => {
        const freshService = new AudioService();
        expect(getItemSpy).toHaveBeenCalledWith(AUDIO_STORAGE_KEY);
        expect(window.Audio).toHaveBeenCalledWith(`assets/audio/effects/${SOUND_EFFECTS_MAP[SoundEffect.Click]}`);
        expect(freshService).toBeTruthy();
    });

    it('should load saved volumes from localStorage when available', () => {
        const delta = 0.1;
        const storedMusicVolume = AUDIO_CONFIG.musicVolume + delta;
        const storedEffectsVolume = AUDIO_CONFIG.effectsVolume - delta;

        const storedSettings = JSON.stringify({
            music: storedMusicVolume,
            effects: storedEffectsVolume,
        });

        getItemSpy.and.returnValue(storedSettings);
        getItemSpy.calls.reset();
        (window.Audio as unknown as jasmine.Spy).calls.reset();

        const freshService = new AudioService();

        expect(getItemSpy).toHaveBeenCalledWith(AUDIO_STORAGE_KEY);
        expect(freshService.getBackgroundMusicVolume()).toBe(storedMusicVolume);
        expect(freshService.getEffectsVolume()).toBe(storedEffectsVolume);
    });

    it('should preload effects for a page', () => {
        const testEffects = [SoundEffect.Click, SoundEffect.Heal];

        service.preloadEffectsForPage(testEffects);

        expect(window.Audio).toHaveBeenCalledTimes(2);
        expect(window.Audio).toHaveBeenCalledWith(`assets/audio/effects/${SOUND_EFFECTS_MAP[SoundEffect.Click]}`);
        expect(window.Audio).toHaveBeenCalledWith(`assets/audio/effects/${SOUND_EFFECTS_MAP[SoundEffect.Heal]}`);
        expect(audioElementSpy.load).toHaveBeenCalledTimes(2);
        expect(service['effects'].size).toBe(2);
    });

    it('should not reload effects that are already loaded', () => {
        service['effects'].set(SoundEffect.Click, effectAudioSpy);
        service.preloadEffectsForPage([SoundEffect.Click]);
        expect(window.Audio).not.toHaveBeenCalled();
    });

    it('should not restart the same track if already playing', () => {
        service['currentTrack'] = BackgroundMusic.Home;
        service['backgroundMusic'] = audioElementSpy;
        Object.defineProperty(audioElementSpy, 'paused', { get: () => false, configurable: true });

        audioElementSpy.play.calls.reset();
        (window.Audio as unknown as jasmine.Spy).calls.reset();

        service.playBackgroundMusic(BackgroundMusic.Home);

        expect(window.Audio).not.toHaveBeenCalled();
        expect(audioElementSpy.play).not.toHaveBeenCalled();
        expect(audioElementSpy.pause).not.toHaveBeenCalled();
    });

    it('should stop current track before playing a new one', () => {
        service['backgroundMusic'] = audioElementSpy;

        service.playBackgroundMusic(BackgroundMusic.Play);

        expect(audioElementSpy.pause).toHaveBeenCalled();
        expect(audioElementSpy.currentTime).toBe(0);
        expect(audioElementSpy.play).toHaveBeenCalled();
    });

    it('should configure audio element correctly when playing background music', () => {
        service.playBackgroundMusic(BackgroundMusic.Home);

        expect(window.Audio).toHaveBeenCalledWith(`assets/audio/music/${BackgroundMusic.Home}`);
        expect(audioElementSpy.loop).toBeTrue();
        expect(audioElementSpy.volume).toBe(AUDIO_CONFIG.musicVolume);
        expect(audioElementSpy.play).toHaveBeenCalled();
        expect(service['currentTrack']).toBe(BackgroundMusic.Home);
    });

    it('should reset previousLogSize when playing background music', () => {
        service['previousLogSize'] = 5;

        service.playBackgroundMusic(BackgroundMusic.Home);

        expect(service['previousLogSize']).toBe(0);
    });

    it('should handle play errors for background music', () => {
        audioElementSpy.play.and.returnValue(Promise.reject('Autoplay prevented'));
        expect(() => service.playBackgroundMusic(BackgroundMusic.Home)).not.toThrow();
    });

    it('should restart same track if it was paused', () => {
        service['currentTrack'] = BackgroundMusic.Home;
        service['backgroundMusic'] = audioElementSpy;
        Object.defineProperty(audioElementSpy, 'paused', { get: () => true, configurable: true });

        service.playBackgroundMusic(BackgroundMusic.Home);

        expect(audioElementSpy.pause).toHaveBeenCalled();
        expect(audioElementSpy.play).toHaveBeenCalled();
    });

    it('should play a preloaded effect', () => {
        service['effects'].set(SoundEffect.Click, effectAudioSpy);
        service.playEffect(SoundEffect.Click);
        expect(effectAudioSpy.currentTime).toBe(0);
        expect(effectAudioSpy.volume).toBe(AUDIO_CONFIG.effectsVolume);
        expect(effectAudioSpy.play).toHaveBeenCalled();
    });

    it('should do nothing if effect is not preloaded', () => {
        service.playEffect(SoundEffect.Click);
        expect(effectAudioSpy.play).not.toHaveBeenCalled();
    });

    it('should handle play errors for sound effects', () => {
        service['effects'].set(SoundEffect.Click, effectAudioSpy);
        effectAudioSpy.play.and.returnValue(Promise.reject('Autoplay prevented'));
        expect(() => service.playEffect(SoundEffect.Click)).not.toThrow();
    });

    it('should not play effects when no new logs are present', () => {
        service['effects'].set(SoundEffect.Attack, effectAudioSpy);
        service['effects'].set(SoundEffect.Flee, effectAudioSpy);
        service['effects'].set(SoundEffect.Death, effectAudioSpy);
        service['previousLogSize'] = 2;
        const matchData = { logData: [{ content: 'abc ab' }] } as MatchData;

        effectAudioSpy.play.calls.reset();
        service.playCombatEffect(matchData);
        expect(effectAudioSpy.play).not.toHaveBeenCalled();
    });

    it('should not play effects when logs length equals previousLogSize', () => {
        service['effects'].set(SoundEffect.Attack, effectAudioSpy);
        service['previousLogSize'] = 1;
        const matchData = { logData: [{ content: 'abc ab' }] } as MatchData;

        effectAudioSpy.play.calls.reset();
        service.playCombatEffect(matchData);
        expect(effectAudioSpy.play).not.toHaveBeenCalled();
    });

    it('should play attack effect when log includes COMBAT_LOG_PATTERNS.attack', () => {
        service['effects'].set(SoundEffect.Attack, effectAudioSpy);

        const matchData = { logData: [{ content: 'abc ab' + COMBAT_LOG_PATTERNS.attack }] } as MatchData;

        service.playCombatEffect(matchData);

        expect(effectAudioSpy.play).toHaveBeenCalledTimes(1);
    });

    it('should play escape effect when log includes COMBAT_LOG_PATTERNS.flee', () => {
        service['effects'].set(SoundEffect.Flee, effectAudioSpy);

        const matchData = { logData: [{ content: 'abc ab' + COMBAT_LOG_PATTERNS.flee }] } as MatchData;

        service.playCombatEffect(matchData);

        expect(effectAudioSpy.play).toHaveBeenCalledTimes(1);
    });

    it('should play death effect and mute music when log includes COMBAT_LOG_PATTERNS.victory', () => {
        service['backgroundMusic'] = audioElementSpy;
        service['effects'].set(SoundEffect.Death, effectAudioSpy);

        const matchData = { logData: [{ content: 'abc ab ' + COMBAT_LOG_PATTERNS.victory }] } as MatchData;

        service.playCombatEffect(matchData);

        expect(audioElementSpy.volume).toBe(0);
        expect(effectAudioSpy.play).toHaveBeenCalledTimes(1);
    });

    it('should not mute music when there is no background music playing', () => {
        service['backgroundMusic'] = null;
        service['effects'].set(SoundEffect.Death, effectAudioSpy);

        const matchData = { logData: [{ content: COMBAT_LOG_PATTERNS.victory }] } as MatchData;

        expect(() => service.playCombatEffect(matchData)).not.toThrow();
        expect(effectAudioSpy.play).toHaveBeenCalledTimes(1);
    });

    it('should update previousLogSize after processing', () => {
        const matchData = { logData: [{ content: 'message 1' }, { content: 'message 2' }] } as MatchData;

        service.playCombatEffect(matchData);

        expect(service['previousLogSize']).toBe(2);
    });

    it('should set and persist background music volume', () => {
        service['backgroundMusic'] = audioElementSpy;
        const newVolume = AUDIO_CONFIG.musicVolume / 2;

        service.setBackgroundMusicVolume(newVolume);

        expect(service['backgroundMusicVolume']).toBe(newVolume);
        expect(audioElementSpy.volume).toBe(newVolume);
        expect(setItemSpy).toHaveBeenCalledWith(AUDIO_STORAGE_KEY, JSON.stringify({ music: newVolume, effects: AUDIO_CONFIG.effectsVolume }));
    });

    it('should set background music volume without updating audio element when no music is playing', () => {
        service['backgroundMusic'] = null;
        const newVolume = AUDIO_CONFIG.musicVolume / 2;

        service.setBackgroundMusicVolume(newVolume);

        expect(service['backgroundMusicVolume']).toBe(newVolume);
        expect(setItemSpy).toHaveBeenCalledWith(AUDIO_STORAGE_KEY, JSON.stringify({ music: newVolume, effects: AUDIO_CONFIG.effectsVolume }));
    });

    it('should use current volume when no parameter is provided to setBackgroundMusicVolume', () => {
        const expectedVolume = 0.5;
        service['backgroundMusicVolume'] = expectedVolume;
        service['backgroundMusic'] = audioElementSpy;

        service.setBackgroundMusicVolume();

        expect(audioElementSpy.volume).toBe(expectedVolume);
        expect(setItemSpy).toHaveBeenCalledWith(AUDIO_STORAGE_KEY, JSON.stringify({ music: expectedVolume, effects: AUDIO_CONFIG.effectsVolume }));
    });

    it('should set and persist effects volume for loaded effects', () => {
        service['effects'].set(SoundEffect.Click, effectAudioSpy);
        const newVolume = AUDIO_CONFIG.effectsVolume / 2;

        service.setEffectsVolume(newVolume);

        expect(service['effectsVolume']).toBe(newVolume);
        expect(effectAudioSpy.volume).toBe(newVolume);
        expect(setItemSpy).toHaveBeenCalledWith(AUDIO_STORAGE_KEY, JSON.stringify({ music: AUDIO_CONFIG.musicVolume, effects: newVolume }));
    });

    it('should set effects volume for all loaded effects', () => {
        const effect1 = jasmine.createSpyObj('HTMLAudioElement', ['play', 'load']);
        effect1.volume = 0;
        const effect2 = jasmine.createSpyObj('HTMLAudioElement', ['play', 'load']);
        effect2.volume = 0;

        service['effects'].set(SoundEffect.Click, effect1);
        service['effects'].set(SoundEffect.Heal, effect2);
        const newVolume = 0.3;

        service.setEffectsVolume(newVolume);

        expect(effect1.volume).toBe(newVolume);
        expect(effect2.volume).toBe(newVolume);
    });

    it('should use current volume when no parameter is provided to setEffectsVolume', () => {
        const expectedVolume = 0.6;
        service['effectsVolume'] = expectedVolume;
        service['effects'].set(SoundEffect.Click, effectAudioSpy);

        service.setEffectsVolume();

        expect(effectAudioSpy.volume).toBe(expectedVolume);
        expect(setItemSpy).toHaveBeenCalledWith(AUDIO_STORAGE_KEY, JSON.stringify({ music: AUDIO_CONFIG.musicVolume, effects: expectedVolume }));
    });
});
