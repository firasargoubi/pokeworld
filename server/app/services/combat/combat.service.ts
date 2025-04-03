import { Match } from '@app/classes/match/match';
import { MapService } from '@app/services/map/map.service';
import { PlayService } from '@app/services/play/play.service';
import {
    COMBAT_ANIMATION_DURATION,
    COMBAT_END_DURATION,
    COMBAT_SHORT_TURN_DURATION,
    COMBAT_TURN_DURATION,
    DEFAULT_PLAYER_COMBAT_DATA,
    HEALING_ITEM_RATIO,
    PATH_ATTACK_MODIFICATION,
    PATH_DEFENSE_MODIFICATION,
} from '@common/consts/combat-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { CombatAction, MatchState, PlayerCombatData } from '@common/interfaces/match-data';
import { PlayerData } from '@common/interfaces/player-data';
import { TileType } from '@common/interfaces/tile-type.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CombatService {
    @Inject(MapService) private readonly mapService: MapService;
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

    attack(match: Match, playerId: string) {
        if (this.canPlayerAct(match, playerId)) {
            this.startAttackAnimation(match);
        }
    }

    escape(match: Match, playerId: string) {
        if (this.canPlayerAct(match, playerId)) {
            this.startEscapeAnimation(match);
        }
    }

    startCombat(match: Match, playerId: string, targetPlayerId: string) {
        match.data.combatData.lastCombatAction = CombatAction.None;
        match.data.combatData.playersCombatData = [this.computePlayerData(match, playerId), this.computePlayerData(match, targetPlayerId)];
        match.data.combatData.isSecondPlayerTurn = match.getPlayer(playerId).speed < match.getPlayer(targetPlayerId).speed;
        this.startCombatWait(match);
    }

    startCombatEndDeath(match: Match) {
        match.data.state = MatchState.CombatEnd;
        match.data.combatData.lastCombatAction = CombatAction.None;
        match.data.players[this.getInactivePlayerData(match).playerIndex].combatsWon += 1;
        const deadPlayer = this.getActivePlayerData(match);
        deadPlayer.currentHealth = 0;
        this.respawnPlayer(match, match.data.players[deadPlayer.playerIndex]);
        match.sendUpdate();
        if (match.data.playData.activePlayerIndex === deadPlayer.playerIndex) {
            match.setTimeout(this.playService.startNextTurn.bind(this.playService, match), COMBAT_END_DURATION);
        } else {
            match.setTimeout(this.playService.continueTurn.bind(this.playService, match), COMBAT_END_DURATION);
        }
    }

    respawnPlayer(match: Match, player: PlayerData) {
        if (player.spawnPoint !== player.position) {
            // TODO drop items on the ground

            player.position = this.movementService.getNearestEmptyTile(match.data, player.spawnPoint);
        }
    }

    private canPlayerAct(match: Match, playerId: string): boolean {
        const index = match.getPlayerIndex(playerId);
        const isFirstPlayer = !match.data.combatData.isSecondPlayerTurn && match.data.combatData.playersCombatData[0].playerIndex === index;
        const isSecondPlayer = match.data.combatData.isSecondPlayerTurn && match.data.combatData.playersCombatData[1].playerIndex === index;
        const isActivePlayer = isFirstPlayer || isSecondPlayer;
        return isActivePlayer && match.isState([MatchState.CombatWait]);
    }

    private startCombatWait(match: Match) {
        match.data.state = MatchState.CombatWait;
        match.data.combatData.turnDuration = this.getActivePlayerData(match).currentEscapes === 0 ? COMBAT_SHORT_TURN_DURATION : COMBAT_TURN_DURATION;

        this.computeHealingItems(match);

        match.sendUpdate();
        match.setTimeout(this.startAttackAnimation.bind(this, match), match.data.combatData.turnDuration);
    }

    private startAttackAnimation(match: Match) {
        match.data.state = MatchState.CombatAnimation;
        this.executeAttack(match);
        match.data.combatData.isSecondPlayerTurn = !match.data.combatData.isSecondPlayerTurn;
        match.sendUpdate();
        if (this.getActivePlayerData(match).currentHealth > 0) {
            match.setTimeout(this.startCombatWait.bind(this, match), COMBAT_ANIMATION_DURATION);
        } else {
            match.setTimeout(this.startCombatEndDeath.bind(this, match), COMBAT_ANIMATION_DURATION);
        }
    }

    private startEscapeAnimation(match: Match) {
        match.data.state = MatchState.CombatAnimation;
        const isEscapeSuccessful = this.executeEscape(match);
        match.data.combatData.isSecondPlayerTurn = !match.data.combatData.isSecondPlayerTurn;
        match.data.combatData.lastCombatAction = isEscapeSuccessful ? CombatAction.SuccessEscape : CombatAction.FailEscape;
        match.sendUpdate();
        if (isEscapeSuccessful) {
            match.setTimeout(this.startCombatEndEscape.bind(this, match), COMBAT_ANIMATION_DURATION);
        } else {
            match.setTimeout(this.startCombatWait.bind(this, match), COMBAT_ANIMATION_DURATION);
        }
    }

    private computeHealingItems(match: Match): boolean {
        const playerCombatData = this.getActivePlayerData(match);
        const player = match.data.players[playerCombatData.playerIndex];

        match.data.players[playerCombatData.playerIndex].items.forEach((item) => {
            switch (item) {
                case ItemType.Item4:
                    if (playerCombatData.currentHealth < player.health * HEALING_ITEM_RATIO) {
                        playerCombatData.currentHealth += 1;
                        return true;
                    }
                    break;
                default:
                    break;
            }
        });
        return false;
    }

    private startCombatEndEscape(match: Match) {
        match.data.state = MatchState.CombatEnd;
        match.sendUpdate();
        match.setTimeout(this.playService.continueTurn.bind(this.playService, match), COMBAT_END_DURATION);
    }

    private executeEscape(match: Match): boolean {
        let isEscapeSuccessful = false;
        const escapingPlayer = this.getActivePlayerData(match);
        if (escapingPlayer.currentEscapes > 0) {
            escapingPlayer.currentEscapes--;
            isEscapeSuccessful = Math.random() < escapingPlayer.escapeChances;
        }
        return isEscapeSuccessful;
    }

    private executeAttack(match: Match) {
        const attackResult = this.computeAttackResult(match);
        match.data.combatData.lastCombatAction = attackResult > 0 ? CombatAction.SuccessAttack : CombatAction.FailAttack;
        const attackedPlayer = this.getInactivePlayerData(match);
        attackedPlayer.currentHealth = Math.max(0, attackedPlayer.currentHealth - attackResult);
    }

    private computeAttackResult(match: Match): number {
        const rolledAttack = this.rollAttack(match);
        const rolledDefense = this.rollDefense(match);
        match.data.combatData.lastRolledAttack = rolledAttack;
        match.data.combatData.lastRolledDefense = rolledDefense;
        return Math.max(0, rolledAttack + this.getActivePlayerData(match).attack - rolledDefense - this.getInactivePlayerData(match).defense);
    }

    private rollAttack(match: Match): number {
        let dice = match.data.players[this.getActivePlayerData(match).playerIndex].attackDice;
        if (!match.data.playData.isDebugMode) {
            dice = Math.floor(Math.random() * dice) + 1;
        }
        return dice;
    }

    private rollDefense(match: Match): number {
        let result = 1;
        const dice = match.data.players[this.getInactivePlayerData(match).playerIndex].defenseDice;
        if (!match.data.playData.isDebugMode) {
            result = Math.floor(Math.random() * dice) + 1;
        }
        return result;
    }

    private getActivePlayerData(match: Match): PlayerCombatData {
        return match.data.combatData.playersCombatData[Number(match.data.combatData.isSecondPlayerTurn)];
    }

    private getInactivePlayerData(match: Match): PlayerCombatData {
        return match.data.combatData.playersCombatData[Number(!match.data.combatData.isSecondPlayerTurn)];
    }

    private computePlayerData(match: Match, playerId: string): PlayerCombatData {
        const player = match.getPlayer(playerId);
        const playerCombatData = {
            ...structuredClone(DEFAULT_PLAYER_COMBAT_DATA),
            playerIndex: match.getPlayerIndex(playerId),
            currentHealth: player.health,
            standingTile: match.data.gameData.mapData.tiles[player.position.x][player.position.y],
        };
        return this.applyCombatBuffs(match, playerCombatData);
    }

    private applyCombatBuffs(match: Match, playerCombatData: PlayerCombatData): PlayerCombatData {
        if (playerCombatData.standingTile === TileType.Path) {
            playerCombatData.attack += PATH_ATTACK_MODIFICATION;
            playerCombatData.defense += PATH_DEFENSE_MODIFICATION;
        }

        match.data.players[playerCombatData.playerIndex].items.forEach((item) => {
            switch (item) {
                case ItemType.Item1:
                    playerCombatData.attack += 1;
                    playerCombatData.defense += 1;
                    break;
                case ItemType.Item2:
                    playerCombatData.attack += 2;
                    playerCombatData.defense += 2;
                    break;
                case ItemType.Item3:
                    if (playerCombatData.standingTile === TileType.Bush) {
                        playerCombatData.attack += 3;
                    }
                    break;
                case ItemType.Item5:
                    playerCombatData.maxEscapes += 1;
                    playerCombatData.currentEscapes += 1;
                    playerCombatData.escapeChances += 0.2;
                    break;
                default:
                    break;
            }
        });

        return playerCombatData;
    }

    private respawnPlayer(match: Match, player: PlayerData) {
        if (player.spawnPoint !== player.position) {
            // TODO drop items on the ground

            player.position = this.movementService.getNearestEmptyTile(match.data, player.spawnPoint);
        }
    }
}
