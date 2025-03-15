import { CombatEvent } from '@common/combat-event.enum';
import { AttackResult, CombatData, CombatResult, CombatState } from '@common/combat-interfaces';
import { DICE_MAX_VALUE, DiceType } from '@common/dice';
import { PlayEvent } from '@common/play-event.enum';
import { Player } from '@common/player';
import { TileType } from '@common/tile-type.enum';
import { Inject, Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
    COMBAT_CODE_LENGTH,
    COMBAT_CODE_RANGE,
    ESCAPE_RATIO,
    MAX_TURN_DURATION,
    MIN_TURN_DURATION,
    PLAYER_STATS_MALUS,
} from './combat.gateway.constants';
import { MatchService } from '@app/services/match/match.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class CombatGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject(MatchService) private readonly matchService: MatchService;
    private combatTurnSystems: Map<string, CombatState> = new Map();

    @SubscribeMessage(PlayEvent.StartCombat)
    startCombat(socket: Socket, targetPlayerId: string): void {
        this.initiateCombat(socket, targetPlayerId);
    }

    @SubscribeMessage(CombatEvent.EscapeAttempt)
    escapeAttempt(_, payload: { combatRoomCode: string; playerId: string }): void {
        this.escape(payload.combatRoomCode, payload.playerId);
    }

    @SubscribeMessage(CombatEvent.AttackAttempt)
    attackAttempt(_, payload: { combatRoomCode: string; targetId: string }): void {
        this.executeAttackAndCheckVictory(payload.combatRoomCode, payload.targetId);
        this.forceCombatTurnSwitch(payload.combatRoomCode);
    }

    handleDisconnect(socket: Socket) {
        for (const [combatRoomCode, state] of this.combatTurnSystems.entries()) {
            if (state.players.some((player) => player.id === socket.id)) {
                // eslint-disable-next-line no-console
                console.log(`CombatGateway: Socket ${socket.id} déconnecté de la room de combat ${combatRoomCode}`);
                this.endCombat(combatRoomCode);
            }
        }
    }

    private initiateCombat(socket: Socket, targetPlayerId: string): void {
        const targetPlayer = this.matchService.getPlayer(targetPlayerId);
        const initiatingPlayer = this.matchService.getPlayer(socket.id);

        const combatRoomCode = this.generateUniqueCombatCode();

        socket.join(combatRoomCode);
        const targetSocket = this.server.sockets.sockets.get(targetPlayerId);
        targetSocket?.join(combatRoomCode);

        const combatData: CombatData = { combatRoomCode, players: [initiatingPlayer, targetPlayer] };
        this.server.to(combatRoomCode).emit(PlayEvent.CombatStarted, combatData);

        this.updatePlayersStatsByCurrentTile([initiatingPlayer, targetPlayer]);
        this.startTurnSystem(combatRoomCode, [initiatingPlayer, targetPlayer]);
    }

    private generateUniqueCombatCode(): string {
        let combatRoomCode: string;
        do {
            const code = Math.floor(Math.random() * COMBAT_CODE_RANGE)
                .toString()
                .padStart(COMBAT_CODE_LENGTH, '0');

            combatRoomCode = `combat-${code}`;
        } while (this.combatTurnSystems.has(combatRoomCode));
        return combatRoomCode;
    }

    private updatePlayersStatsByCurrentTile(players: Player[]) {
        for (const player of players) {
            if (player.currentStats.standingTile === TileType.Path) {
                player.currentStats.attack -= PLAYER_STATS_MALUS;
                player.currentStats.defense -= PLAYER_STATS_MALUS;
            }
        }
    }

    private startTurnSystem(combatRoomCode: string, players: Player[]): void {
        const player1 = players[0];
        const player2 = players[1];

        if (player2.playerStats.speed > player1.playerStats.speed) {
            players = [players[1], players[0]];
        }

        this.combatTurnSystems.set(combatRoomCode, {
            timer: null,
            players,
            currentTurnIndex: 0,
        });

        this.updatePlayerBonusStats(combatRoomCode, players[1]);
        this.proceedCombatTurn(combatRoomCode);
    }

    private proceedCombatTurn(combatRoomCode: string): void {
        const state = this.combatTurnSystems.get(combatRoomCode);
        const { players, currentTurnIndex } = state;
        const activePlayer = players[currentTurnIndex];
        const inactivePlayer = players[1 - currentTurnIndex];

        let turnDelay = MAX_TURN_DURATION;
        if (activePlayer.currentStats.escapes === 0) {
            turnDelay = MIN_TURN_DURATION;
        }

        this.updatePlayerBonusStats(combatRoomCode, activePlayer);
        this.server.to(combatRoomCode).emit(CombatEvent.StartTimer, turnDelay);
        this.server.to(activePlayer.id).emit(CombatEvent.CombatTurnStarted);
        this.server.to(inactivePlayer.id).emit(CombatEvent.CombatTurnStopped);

        const timer = setTimeout(() => {
            const victory = this.executeAttackAndCheckVictory(combatRoomCode, inactivePlayer.id);

            if (!victory) {
                state.currentTurnIndex = 1 - currentTurnIndex;
                this.combatTurnSystems.set(combatRoomCode, state);
                this.proceedCombatTurn(combatRoomCode);
            }
            return;
        }, turnDelay);

        state.timer = timer;
        this.combatTurnSystems.set(combatRoomCode, state);
    }

    private forceCombatTurnSwitch(combatRoomCode: string): void {
        const state = this.combatTurnSystems.get(combatRoomCode);
        if (!state) {
            return;
        }
        clearTimeout(state.timer);

        state.currentTurnIndex = 1 - state.currentTurnIndex;
        this.combatTurnSystems.set(combatRoomCode, state);

        this.proceedCombatTurn(combatRoomCode);
    }

    private escape(combatRoomCode: string, playerId: string): void {
        const state = this.combatTurnSystems.get(combatRoomCode);
        if (!state) return;

        const player = this.matchService.getPlayer(playerId);

        if (player.currentStats.escapes > 0) {
            player.currentStats.escapes--;
            this.notifyPlayersStatsUpdate(combatRoomCode);

            if (Math.random() < ESCAPE_RATIO) {
                this.server.to(combatRoomCode).emit(CombatEvent.EscapedResult, playerId);
                this.endCombat(combatRoomCode);
            }
        }
        this.forceCombatTurnSwitch(combatRoomCode);
    }

    private executeAttackAndCheckVictory(combatRoomCode: string, targetId: string): boolean | void {
        const state = this.combatTurnSystems.get(combatRoomCode);
        if (!state) return;

        const currentPlayer = this.matchService.getPlayer(state.players[state.currentTurnIndex].id);
        const targetPlayer = this.matchService.getPlayer(targetId);
        if (!currentPlayer || !targetPlayer) return;

        const attackDamage =
            currentPlayer.currentStats.attack +
            currentPlayer.currentStats.attackBonus -
            (targetPlayer.currentStats.defense + targetPlayer.currentStats.defenseBonus);

        if (attackDamage > 0) {
            targetPlayer.currentStats.health = Math.max(0, targetPlayer.currentStats.health - attackDamage);
            this.notifyPlayersStatsUpdate(combatRoomCode);
        }

        const attackResult: AttackResult = { targetId, attackDamage };
        this.server.to(combatRoomCode).emit(CombatEvent.AttackResult, attackResult);

        if (targetPlayer.currentStats.health <= 0) {
            this.endCombat(combatRoomCode, currentPlayer.id);
            return true;
        }

        return false;
    }

    private getBonusValue(diceType: DiceType): number {
        const maxValue = DICE_MAX_VALUE[diceType];
        return Math.floor(Math.random() * maxValue) + 1;
    }

    private updatePlayerBonusStats(combatRoomCode: string, player: Player): void {
        player.currentStats.attackBonus = this.getBonusValue(player.playerStats.attackDice);
        player.currentStats.defenseBonus = this.getBonusValue(player.playerStats.defenseDice);

        this.notifyPlayersStatsUpdate(combatRoomCode);
    }

    private notifyPlayersStatsUpdate(combatRoomCode: string) {
        const state = this.combatTurnSystems.get(combatRoomCode);
        if (!state) return;

        this.server.to(combatRoomCode).emit(CombatEvent.UpdatePlayers, state.players);
    }

    private resetPlayers(players: Player[]): void {
        for (const player of players) {
            player.currentStats.health = player.playerStats.health;
            player.currentStats.attack = player.playerStats.attack;
            player.currentStats.defense = player.playerStats.defense;
            player.currentStats.escapes = player.playerStats.escapes;
        }
    }

    private endCombat(combatRoomCode: string, winnerId: string = null): void {
        const state = this.combatTurnSystems.get(combatRoomCode);
        if (!state) return;

        if (state.timer) {
            clearTimeout(state.timer);
        }

        const player1 = this.combatTurnSystems.get(combatRoomCode).players[0];
        const player2 = this.combatTurnSystems.get(combatRoomCode).players[1];

        const combatResult: CombatResult = { winnerId: null, loserId: null };

        this.resetPlayers([player1, player2]);

        if (winnerId) {
            combatResult.winnerId = winnerId;
            combatResult.loserId = player1.id === winnerId ? player2.id : player1.id;
        }

        this.server.to(combatRoomCode).emit(CombatEvent.EndCombat, combatResult);

        this.combatTurnSystems.delete(combatRoomCode);

        this.leaveCombat(combatRoomCode, state);
    }

    private leaveCombat(combatRoomCode: string, state: { timer: NodeJS.Timeout; players: Player[]; currentTurnIndex: number }): void {
        for (const player of state.players) {
            const socket = this.server.sockets.sockets.get(player.id);
            if (socket) {
                socket.leave(combatRoomCode);
            }
        }
    }
}
