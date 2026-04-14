import { Injectable } from '@angular/core';
import { AudioSettings, BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { MatchData } from '@common/interfaces/match-data';
import { Avatar } from '@common/interfaces/player-data';
import { AUDIO_CONFIG, AUDIO_LOCAL_STORAGE_KEY, AVATAR_SOUNDS, COMBAT_LOG_KEYS, COMBAT_LOG_PATTERNS, SOUND_EFFECTS_MAP } from './audio.const';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private backgroundMusic: HTMLAudioElement | null = null;
    private effects: Map<SoundEffect, HTMLAudioElement> = new Map();
    private avatarsSounds: Map<Avatar, HTMLAudioElement> = new Map();
    private currentTrack: BackgroundMusic | null = null;
    private previousLogSize = 0;
    private backgroundMusicVolume = AUDIO_CONFIG.backgroundMusicVolume;
    private effectsVolume = AUDIO_CONFIG.effectsVolume;
    private avatarsVolume = AUDIO_CONFIG.avatarsVolume;

    constructor() {
        this.loadSavedVolumes();
        this.preloadEffectsForPage([SoundEffect.Click]);
    }

    preloadEffectsForPage(effects: SoundEffect[]): void {
        effects.forEach((effect) => {
            if (!this.effects.has(effect)) {
                const path = SOUND_EFFECTS_MAP[effect];
                const audio = new Audio(`assets/audio/effects/${path}`);
                audio.load();
                this.effects.set(effect, audio);
            }
        });
    }

    preloadAvatarSounds(avatars: Avatar[]): void {
        avatars.forEach((avatar) => {
            if (!this.avatarsSounds.has(avatar)) {
                const soundFile = AVATAR_SOUNDS[avatar];
                if (soundFile) {
                    const audio = new Audio(`assets/audio/avatars/${soundFile}`);
                    audio.load();
                    this.avatarsSounds.set(avatar, audio);
                }
            }
        });
    }

    playBackgroundMusic(music: BackgroundMusic): void {
        this.previousLogSize = 0;
        if (this.currentTrack === music && this.backgroundMusic && !this.backgroundMusic.paused) {
            return;
        }

        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }

        const fullPath = `assets/audio/music/${music}`;
        const audio = new Audio(fullPath);
        audio.loop = true;
        audio.volume = this.backgroundMusicVolume;

        audio.play().catch((error) => {
            return error;
        });

        this.backgroundMusic = audio;
        this.currentTrack = music;
    }

    stopBackgroundMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
        }
        this.currentTrack = null;
    }

    playEffect(effect: SoundEffect): void {
        const audioEffect = this.effects.get(effect);
        if (audioEffect) {
            audioEffect.volume = this.effectsVolume;
            audioEffect.currentTime = 0;
            audioEffect.play().catch((error) => {
                return error;
            });
        }
    }

    playCombatEffect(matchData: MatchData): void {
        const currentLogs = matchData.logData;
        if (currentLogs.length <= this.previousLogSize) {
            return;
        }

        const lastLog = currentLogs[currentLogs.length - 1];

        const logText = lastLog.content.toLowerCase();
        const logKey = lastLog.content;
        const isAttack = logKey === COMBAT_LOG_KEYS.attack || logText.includes(COMBAT_LOG_PATTERNS.attack);
        const isFlee = logKey === COMBAT_LOG_KEYS.flee || logText.includes(COMBAT_LOG_PATTERNS.flee);
        const isVictory = logKey === COMBAT_LOG_KEYS.victory || logText.includes(COMBAT_LOG_PATTERNS.victory);

        if (isAttack) {
            this.playEffect(SoundEffect.Attack);
        } else if (isFlee) {
            this.playEffect(SoundEffect.Flee);
        } else if (isVictory) {
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = 0;
            }
            this.playEffect(SoundEffect.Death);
        }

        this.previousLogSize = currentLogs.length;
    }

    playAvatarsSounds(avatars: Avatar[]): void {
        let index = 0;
        const playNext = () => {
            if (index < avatars.length) {
                const avatar = avatars[index];
                const soundFile = AVATAR_SOUNDS[avatar];
                if (soundFile) {
                    const audio = this.avatarsSounds.get(avatar);
                    if (audio) {
                        audio.volume = this.avatarsVolume;
                        audio.play();
                        audio.onended = () => {
                            index++;
                            setTimeout(playNext, AUDIO_CONFIG.avatarSoundInterval);
                        };
                    }
                } else {
                    index++;
                    setTimeout(playNext, AUDIO_CONFIG.avatarSoundInterval);
                }
            }
        };

        playNext();
    }

    setBackgroundMusicVolume(volume: number = this.backgroundMusicVolume): void {
        this.backgroundMusicVolume = this.validateVolume(volume, AUDIO_CONFIG.backgroundMusicVolume);
        this.saveSettings();
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.backgroundMusicVolume;
        }
    }

    setEffectsVolume(volume: number = this.effectsVolume): void {
        this.effectsVolume = this.validateVolume(volume, AUDIO_CONFIG.effectsVolume);
        this.saveSettings();
        this.effects.forEach((audioEffect) => {
            audioEffect.volume = this.effectsVolume;
        });
    }

    setAvatarsVolume(volume: number = this.avatarsVolume): void {
        this.avatarsVolume = this.validateVolume(volume, AUDIO_CONFIG.avatarsVolume);
        this.saveSettings();
    }

    getBackgroundMusicVolume(): number {
        return this.backgroundMusicVolume;
    }

    getEffectsVolume(): number {
        return this.effectsVolume;
    }

    getAvatarsVolume(): number {
        return this.avatarsVolume;
    }

    private saveSettings(): void {
        const settings: AudioSettings = {
            backgroundMusicVolume: this.backgroundMusicVolume,
            effectsVolume: this.effectsVolume,
            avatarsVolume: this.avatarsVolume,
        };
        localStorage.setItem(AUDIO_LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }

    private validateVolume(volume: number, defaultValue: number): number {
        const isValidNumber = typeof volume === 'number' && isFinite(volume);
        const isInRange = volume >= 0 && volume <= 1;
        return isValidNumber && isInRange ? volume : defaultValue;
    }

    private loadSavedVolumes(): void {
        const storedSettings = localStorage.getItem(AUDIO_LOCAL_STORAGE_KEY);
        if (storedSettings !== null) {
            try {
                const settings: AudioSettings = JSON.parse(storedSettings);
                this.backgroundMusicVolume = this.validateVolume(settings.backgroundMusicVolume, AUDIO_CONFIG.backgroundMusicVolume);
                this.effectsVolume = this.validateVolume(settings.effectsVolume, AUDIO_CONFIG.effectsVolume);
                this.avatarsVolume = this.validateVolume(settings.avatarsVolume, AUDIO_CONFIG.avatarsVolume);
            } catch (error) {
                this.backgroundMusicVolume = AUDIO_CONFIG.backgroundMusicVolume;
                this.effectsVolume = AUDIO_CONFIG.effectsVolume;
                this.avatarsVolume = AUDIO_CONFIG.avatarsVolume;
            }
        }
    }
}
