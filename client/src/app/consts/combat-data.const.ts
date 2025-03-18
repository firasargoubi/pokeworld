import { CombatAnimations } from '@app/interfaces/combat-animations';

export const DEFAULT_COMBAT_ANIMATIONS: CombatAnimations = {
    selfDamage: false,
    ennemyDamage: false,

    selfattack: false,
    ennemyattack: false,

    selfEscape: false,
    ennemyEscape: false,

    selfDeath: false,
    ennemyDeath: false,
};

export const COMBAT_TIME_SCALE = 1000;
