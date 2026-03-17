import { PlayerCombatData } from '@common/interfaces/match-data';

export interface CombatVisualData {
    isSelfTurn: boolean;
    selfPlayer: PlayerCombatData;
    enemyPlayer: PlayerCombatData;
    selfImage: string;
    enemyImage: string;
    selfPlatform: string;
    enemyPlatform: string;
    isSelfHealing: boolean;
    isEnemyHealing: boolean;
    selfElementalIcon?: string;
    enemyElementalIcon?: string;
    isSelfElementalAdvantage?: boolean;
    isEnemyElementalAdvantage?: boolean;
    selfProfilePicture?: string;
    enemyProfilePicture?: string;
}
