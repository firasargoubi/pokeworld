import { Match } from './match';
import { Player } from './player';

export interface CombatData {
    combatRoomCode: string;
    players: Player[];
}

export interface CombatResult {
    winnerId: string | null;
    loserId: string | null;
}

export interface AttackResult {
    targetId: string;
    attackDamage: number;
}

export interface CombatState {
    timer: ReturnType<typeof setTimeout>;
    players: Player[];
    currentTurnIndex: number;
}

export interface EscapeAttempt {
    combatRoomCode: string;
    playerId: string | undefined;
}

export interface AttackAttempt {
    combatRoomCode: string;
    targetId: string | undefined;

}

export interface CombatBroadcastData {
    match: Match,
    playerOneIndex: number,
    playerTwoIndex: number,
}
