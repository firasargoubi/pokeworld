import { Avatars } from '../avatars.enum';
import { DiceType } from '../dice';
import { Player } from '../player';
import { TileType } from '../tile-type.enum';

export const DEFAULT_PLAYER: Player = {
    id: '',
    name: '',
    avatar: Avatars.Default,
    playerStats: {
        health: 6,
        speed: 4,
        attack: 4,
        defense: 4,
        attackDice: DiceType.D6,
        defenseDice: DiceType.D4,
        escapes: 2,
    },
    currentStats: {
        health: 6,
        speed: 4,
        attack: 4,
        defense: 4,
        escapes: 2,
        attackBonus: 0,
        defenseBonus: 0,
        items: [],
        position: { x: 0, y: 0 },
        movement: 0,
        hasAction: false,
        fightsWon: 0,
        standingTile: TileType.Grass,
    },
    isAdmin: false,
    isConnected: false,
    isBot: false,
    spawnPoint: { x: 0, y: 0 },
};
