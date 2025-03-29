import { Match } from '@app/classes/match/match';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CombatService {
    // eslint-disable-next-line no-unused-vars
    attack(match: Match, playerId: string) {
        // TODO
    }

    // eslint-disable-next-line no-unused-vars
    escape(match: Match, playerId: string) {
        // TODO
    }

    startCombat(match: Match, playerId: string, targetPlayerId: string) {
        // TODO
        // eslint-disable-next-line no-console
        console.log('startCombat', match.data.state, playerId, targetPlayerId);
        match.sendUpdate();
    }

    // private respawnPlayer(playerId: string, matchCode: string) {
    //     const match = this.matchService.getMatch(matchCode);
    //     if (match) {
    //         const player = this.matchService.getPlayer(match.matchData.code, playerId);
    //         if (player && player.isConnected) {
    //             if (player.spawnPoint !== player.currentStats.position) {
    //                 const position = this.movementService.getNearestEmptyTile(player.spawnPoint, match);
    //                 player.currentStats.position = position;
    //             }
    //         }
    //     }
    // }

    // initiateCombat(playerId: string, targetPlayerId: string, matchCode: string): void {
    //     const targetPlayer = this.matchService.getPlayer(matchCode, targetPlayerId);
    //     const initiatingPlayer = this.matchService.getPlayer(matchCode, playerId);

    //     const combatRoomCode = this.generateUniqueCombatCode();

    //     this.combatGateway.getSocketById(playerId).join(combatRoomCode);
    //     const targetSocket = this.combatGateway.getSocketById(targetPlayerId);
    //     if (targetSocket) {
    //         targetSocket.join(combatRoomCode);
    //     }

    //     const combatData: CombatData = { combatRoomCode, players: [initiatingPlayer, targetPlayer] };
    //     this.combatGateway.emitToCombatRoom(combatRoomCode, CombatEvent.CombatStarted, combatData);

    //     this.resetPlayers([initiatingPlayer, targetPlayer]);
    //     this.updatePlayersStatsByCurrentTile([initiatingPlayer, targetPlayer]);
    //     this.startTurnSystem(combatRoomCode, [initiatingPlayer, targetPlayer], matchCode);
    // }

    // escape(combatRoomCode: string, playerId: string): void {
    //     const state = this.combatTurnSystems.get(combatRoomCode);
    //     if (!state) return;

    //     const player = this.getPlayerById(combatRoomCode, playerId);

    //     if (player.currentStats.escapes > 0) {
    //         player.currentStats.escapes--;
    //         this.notifyPlayersStatsUpdate(combatRoomCode);

    //         if (Math.random() < ESCAPE_RATIO) {
    //             this.combatGateway.emitToCombatRoom(combatRoomCode, CombatEvent.EscapedResult, playerId);
    //             this.endCombat(combatRoomCode);
    //         }
    //     }
    //     this.forceCombatTurnSwitch(combatRoomCode);
    // }

    // executeAttackAndCheckVictory(combatRoomCode: string, targetId: string): boolean | void {
    //     const state = this.combatTurnSystems.get(combatRoomCode);
    //     const currentPlayer = this.getPlayerById(combatRoomCode, state.players[state.currentTurnIndex].id);
    //     const targetPlayer = this.getPlayerById(combatRoomCode, targetId);
    //     if (!currentPlayer || !targetPlayer) return;

    //     const attackDamage =
    //         currentPlayer.currentStats.attack +
    //         currentPlayer.currentStats.attackBonus -
    //         (targetPlayer.currentStats.defense + targetPlayer.currentStats.defenseBonus);

    //     if (attackDamage > 0) {
    //         targetPlayer.currentStats.health = Math.max(0, targetPlayer.currentStats.health - attackDamage);
    //         this.notifyPlayersStatsUpdate(combatRoomCode);
    //     }

    //     const attackResult: AttackResult = { targetId, attackDamage };
    //     this.combatGateway.emitToCombatRoom(combatRoomCode, CombatEvent.AttackResult, attackResult);

    //     if (targetPlayer.currentStats.health <= 0) {
    //         this.endCombat(combatRoomCode, currentPlayer.id);
    //         return true;
    //     }

    //     return false;
    // }

    // endCombat(combatRoomCode: string, winnerId: string = null): void {
    //     const state = this.combatTurnSystems.get(combatRoomCode);
    //     if (state.timer) {
    //         clearTimeout(state.timer);
    //     }

    //     const player1 = this.combatTurnSystems.get(combatRoomCode).players[0];
    //     const player2 = this.combatTurnSystems.get(combatRoomCode).players[1];
    //     const combatResult: CombatResult = { winnerId: null, loserId: null };
    //     this.resetPlayers([player1, player2]);

    //     let winner: Player = null;
    //     if (winnerId) {
    //         combatResult.winnerId = winnerId;
    //         combatResult.loserId = player1.id === winnerId ? player2.id : player1.id;
    //         winner = player1.id === winnerId ? player1 : player2;
    //     }
    //     this.combatGateway.emitToCombatRoom(combatRoomCode, CombatEvent.EndCombat, winner);

    //     this.combatTurnSystems.delete(combatRoomCode);
    //     this.leaveCombat(combatRoomCode, state);
    //     this.playService.endOfCombat(state.matchCode, combatResult, player1.id);
    // }

    // forceCombatTurnSwitch(combatRoomCode: string): void {
    //     const state = this.combatTurnSystems.get(combatRoomCode);
    //     if (!state) {
    //         return;
    //     }
    //     clearTimeout(state.timer);

    //     state.currentTurnIndex = 1 - state.currentTurnIndex;
    //     this.combatTurnSystems.set(combatRoomCode, state);

    //     this.proceedCombatTurn(combatRoomCode);
    // }

    // private generateUniqueCombatCode(): string {
    //     let combatRoomCode: string;
    //     do {
    //         const code = Math.floor(Math.random() * COMBAT_CODE_RANGE)
    //             .toString()
    //             .padStart(COMBAT_CODE_LENGTH, '0');

    //         combatRoomCode = `combat-${code}`;
    //     } while (this.combatTurnSystems.has(combatRoomCode));
    //     return combatRoomCode;
    // }

    // private updatePlayersStatsByCurrentTile(players: Player[]) {
    //     for (const player of players) {
    //         if (player.currentStats.standingTile === TileType.Path) {
    //             player.currentStats.attack -= PLAYER_STATS_MALUS;
    //             player.currentStats.defense -= PLAYER_STATS_MALUS;
    //         }
    //     }
    // }

    // private startTurnSystem(combatRoomCode: string, players: Player[], matchCode: string): void {
    //     const player1 = players[0];
    //     const player2 = players[1];

    //     if (player2.playerStats.speed > player1.playerStats.speed) {
    //         players = [players[1], players[0]];
    //     }

    //     this.combatTurnSystems.set(combatRoomCode, {
    //         matchCode,
    //         timer: null,
    //         players,
    //         currentTurnIndex: 0,
    //     });

    //     this.proceedCombatTurn(combatRoomCode);
    // }

    // private proceedCombatTurn(combatRoomCode: string): void {
    //     const state = this.combatTurnSystems.get(combatRoomCode);
    //     const { players, currentTurnIndex } = state;
    //     const activePlayer = players[currentTurnIndex];
    //     const inactivePlayer = players[1 - currentTurnIndex];

    //     let turnDelay = MAX_TURN_DURATION;
    //     if (activePlayer.currentStats.escapes === 0) {
    //         turnDelay = MIN_TURN_DURATION;
    //     }

    //     this.updatePlayerBonusStats(combatRoomCode, activePlayer, true);
    //     this.updatePlayerBonusStats(combatRoomCode, inactivePlayer, false);
    //     this.combatGateway.emitToCombatRoom(combatRoomCode, CombatEvent.StartTimer, turnDelay);
    //     this.combatGateway.emitToPlayer(activePlayer.id, CombatEvent.CombatTurnStarted);
    //     this.combatGateway.emitToPlayer(inactivePlayer.id, CombatEvent.CombatTurnStopped);

    //     const timer = setTimeout(() => {
    //         const victory = this.executeAttackAndCheckVictory(combatRoomCode, inactivePlayer.id);

    //         if (!victory) {
    //             state.currentTurnIndex = 1 - currentTurnIndex;
    //             this.combatTurnSystems.set(combatRoomCode, state);
    //             this.proceedCombatTurn(combatRoomCode);
    //         }
    //         return;
    //     }, turnDelay);

    //     state.timer = timer;
    //     this.combatTurnSystems.set(combatRoomCode, state);
    // }

    // private getBonusValue(diceType: DiceType): number {
    //     const maxValue = DICE_MAX_VALUE[diceType];
    //     return Math.floor(Math.random() * maxValue) + 1;
    // }

    // private updatePlayerBonusStats(combatRoomCode: string, player: Player, updateAttack: boolean): void {
    //     const state = this.combatTurnSystems.get(combatRoomCode);
    //     const match = this.matchService.getMatch(state.matchCode);
    //     if (updateAttack) {
    //         if (match.matchData.isDebugMode) {
    //             player.currentStats.attackBonus = DICE_MAX_VALUE[player.playerStats.attackDice];
    //         } else {
    //             player.currentStats.attackBonus = this.getBonusValue(player.playerStats.attackDice);
    //         }
    //     } else {
    //         if (match.matchData.isDebugMode) {
    //             player.currentStats.defenseBonus = 1;
    //         } else {
    //             player.currentStats.defenseBonus = this.getBonusValue(player.playerStats.defenseDice);
    //         }
    //     }

    //     this.notifyPlayersStatsUpdate(combatRoomCode);
    // }

    // private notifyPlayersStatsUpdate(combatRoomCode: string) {
    //     const state = this.combatTurnSystems.get(combatRoomCode);

    //     this.combatGateway.emitToCombatRoom(combatRoomCode, CombatEvent.UpdatePlayers, state.players);
    // }

    // private resetPlayers(players: Player[]): void {
    //     for (const player of players) {
    //         player.currentStats.health = player.playerStats.health;
    //         player.currentStats.attack = player.playerStats.attack;
    //         player.currentStats.defense = player.playerStats.defense;
    //         player.currentStats.escapes = player.playerStats.escapes;
    //     }
    // }

    // private leaveCombat(combatRoomCode: string, state: CombatState): void {
    //     for (const player of state.players) {
    //         const socket = this.combatGateway.getSocketById(player.id);

    //         if (socket) {
    //             socket.leave(combatRoomCode);
    //         }
    //     }
    // }

    // private getPlayerById(combatRoomCode: string, playerId: string): Player {
    //     return this.combatTurnSystems.get(combatRoomCode).players.find((p) => p.id === playerId);
    // }
}
