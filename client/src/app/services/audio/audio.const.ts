import { SoundEffect } from '@app/interfaces/sound-service';
import { Avatar } from '@common/interfaces/player-data';

export const SOUND_EFFECTS_MAP: Record<SoundEffect, string> = {
    [SoundEffect.Flee]: 'flee.wav',
    [SoundEffect.Attack]: 'attack.wav',
    [SoundEffect.Death]: 'death.mp3',
    [SoundEffect.Heal]: 'heal.wav',
    [SoundEffect.Item]: 'item.wav',
    [SoundEffect.Click]: 'select.wav',
};

export const PLAY_PAGE_EFFECT: SoundEffect[] = [SoundEffect.Item];

export const COMBAT_PAGE_EFFECTS: SoundEffect[] = [SoundEffect.Attack, SoundEffect.Death, SoundEffect.Heal, SoundEffect.Flee];

export const AUDIO_CONFIG = {
    backgroundMusicVolume: 0.2,
    effectsVolume: 0.8,
    avatarsVolume: 0.8,
    fadeInDuration: 1000,
    fadeOutDuration: 500,
    fadeStepInterval: 50,
    avatarSoundInterval: 500,
};

export const COMBAT_LOG_PATTERNS = {
    attack: 'inflige',
    flee: "s'est enfui",
    victory: 'gagné le combat',
};

export const COMBAT_LOG_KEYS = {
    attack: 'server.logs.attackResult.damage',
    flee: 'server.logs.combatEnd.escape',
    victory: 'server.logs.combatEnd.victory',
};

export const AUDIO_LOCAL_STORAGE_KEY = 'audio_settings';

export const AVATAR_SOUNDS: Record<Avatar, string> = {
    [Avatar.Default]: 'Bulbasaur.wav',
    [Avatar.Avatar1]: 'Bulbasaur.wav',
    [Avatar.Avatar2]: 'Squirtle.wav',
    [Avatar.Avatar3]: 'Charmander.wav',
    [Avatar.Avatar4]: 'Pikachu.wav',
    [Avatar.Avatar5]: 'Jigglypuff.wav',
    [Avatar.Avatar6]: 'Psyduck.wav',
    [Avatar.Avatar7]: 'Vulpix.wav',
    [Avatar.Avatar8]: 'Eevee.wav',
    [Avatar.Avatar9]: 'Cubone.wav',
    [Avatar.Avatar10]: 'Magikarp.wav',
    [Avatar.Avatar11]: 'Dragonair.wav',
    [Avatar.Avatar12]: 'Mew.wav',
    [Avatar.Avatar1Shiny]: 'Bulbasaur.wav',
    [Avatar.Avatar2Shiny]: 'Squirtle.wav',
    [Avatar.Avatar3Shiny]: 'Charmander.wav',
    [Avatar.Avatar4Shiny]: 'Pikachu.wav',
    [Avatar.Avatar5Shiny]: 'Jigglypuff.wav',
    [Avatar.Avatar6Shiny]: 'Psyduck.wav',
    [Avatar.Avatar7Shiny]: 'Vulpix.wav',
    [Avatar.Avatar8Shiny]: 'Eevee.wav',
    [Avatar.Avatar9Shiny]: 'Cubone.wav',
    [Avatar.Avatar10Shiny]: 'Magikarp.wav',
    [Avatar.Avatar11Shiny]: 'Dragonair.wav',
    [Avatar.Avatar12Shiny]: 'Mew.wav',
    [Avatar.Avatar1Evolved]: 'Venusaur.wav',
    [Avatar.Avatar2Evolved]: 'Blastoise.wav',
    [Avatar.Avatar3Evolved]: 'Charizard.wav',
    [Avatar.Avatar4Evolved]: 'Raichu.wav',
    [Avatar.Avatar5Evolved]: 'Wigglytuff.wav',
    [Avatar.Avatar6Evolved]: 'Golduck.wav',
    [Avatar.Avatar7Evolved]: 'Ninetales.wav',
    [Avatar.Avatar8Evolved]: 'Flareon.wav',
    [Avatar.Avatar9Evolved]: 'Marowak.wav',
    [Avatar.Avatar10Evolved]: 'Gyarados.wav',
    [Avatar.Avatar11Evolved]: 'Dragonite.wav',
    [Avatar.Avatar12Evolved]: 'Mewtwo.wav',
    [Avatar.Avatar1EvolvedShiny]: 'Venusaur.wav',
    [Avatar.Avatar2EvolvedShiny]: 'Blastoise.wav',
    [Avatar.Avatar3EvolvedShiny]: 'Charizard.wav',
    [Avatar.Avatar4EvolvedShiny]: 'Raichu.wav',
    [Avatar.Avatar5EvolvedShiny]: 'Wigglytuff.wav',
    [Avatar.Avatar6EvolvedShiny]: 'Golduck.wav',
    [Avatar.Avatar7EvolvedShiny]: 'Ninetales.wav',
    [Avatar.Avatar8EvolvedShiny]: 'Flareon.wav',
    [Avatar.Avatar9EvolvedShiny]: 'Marowak.wav',
    [Avatar.Avatar10EvolvedShiny]: 'Gyarados.wav',
    [Avatar.Avatar11EvolvedShiny]: 'Dragonite.wav',
    [Avatar.Avatar12EvolvedShiny]: 'Mewtwo.wav',
    [Avatar.MissingNo]: 'MissingNo.wav',
};
