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
