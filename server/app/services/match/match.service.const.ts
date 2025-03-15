import { Avatars } from '@common/avatars.enum';
import { MatchData, TurnPhase } from '@common/match';
import { DiceType } from '@common/dice';
import { Player } from '@common/player';
import { TileType } from '@common/tile-type.enum';
import { TurnData } from '@app/interfaces/turn-data';

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
};

export const DEFAULT_MATCH_DATA: MatchData = {
    code: '',
    isLocked: false,
    isStarted: false,
    isDebugMode: false,
    activePlayer: 0,
    players: [],
    maxTimer: 0,
    currentTimer: 0,
    phase: TurnPhase.PreTurn,
};

export const CODE_RANGE = 10000;
export const CODE_LENGTH = 4;

export const DEFAULT_TURN_DATA: TurnData = {
    lastPhaseStartTime: new Date(),
    phaseTimeout: null,
};
