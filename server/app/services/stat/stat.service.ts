import { Match } from '@app/classes/match/match';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode } from '@common/interfaces/map-data';
import { PlayerCombatData } from '@common/interfaces/match-data';
import { PlayerData } from '@common/interfaces/player-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CombatService } from '@app/services/combat/combat.service';
import { TrackingPlayerData } from '@common/interfaces/track-data';

@Injectable()
export class StatService {
    @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService;

    startTrackingMatch(match: Match): void {
        match.data.trackingData.startTime = Date.now();
    }

    stopTrackingMatch(match: Match): void {
        match.data.trackingData.endTime = Date.now();
    }

    updateHps(match: Match, attackResult: number): void {
        const attacked = this.combatService.getInactivePlayerData(match);
        const attacker = this.combatService.getActivePlayerData(match);
        const attackedId = match.data.players[attacked.playerIndex].id;
        this.getPlayerStat(match, attackedId).hpLost += Math.min(attackResult, attacked.currentHealth);
        const attackerId = match.data.players[attacker.playerIndex].id;
        this.getPlayerStat(match, attackerId).hpInflicted += Math.min(attackResult, attacked.currentHealth);
    }

    updateEscapes(match: Match, player: PlayerCombatData): void {
        const escaperId = match.data.players[player.playerIndex].id;
        ++this.getPlayerStat(match, escaperId).escapes;
    }

    updateCombats(match: Match, winner: PlayerCombatData, loser: PlayerCombatData): void {
        const winnerId = match.data.players[winner.playerIndex].id;
        const loserId = match.data.players[loser.playerIndex].id;
        ++this.getPlayerStat(match, winnerId).victories;
        ++this.getPlayerStat(match, loserId).defeats;
        ++this.getPlayerStat(match, winnerId).combats;
        ++this.getPlayerStat(match, loserId).combats;
    }

    updateRounds(match: Match): void {
        ++match.data.trackingData.rounds;
    }

    updateWinner(match: Match, winner: PlayerData): void {
        const winnerId = winner.id;
        const winnerIndex = match.getPlayerIndex(winnerId);
        const standingTile = match.data.combatData.playersCombatData[winnerIndex].standingTile;
        match.data.trackingData.matchWinner = { id: winnerId, avatar: winner.avatar, name: winner.name, tile: standingTile };
    }

    updateItems(match: Match, item: ItemType, playerId: string): void {
        const itemList = this.getPlayerStat(match, playerId).pickedUpItems;
        const isNewItem = !itemList.includes(item);
        if (isNewItem) {
            const gameMode = match.data.gameData.mapData.gameMode;
            if (gameMode === GameMode.CTF && item === ItemType.Flag) {
                ++match.data.trackingData.flagHoldersCount;
            }
            itemList.push(item);
        }
    }

    updateGroundTiles(match: Match, position: Position, playerId: string): void {
        const tilePositions = match.data.gameData.mapData.tiles;
        const targetTile = tilePositions[position.x][position.y];
        if (targetTile !== TileType.Bridge) {
            let visitedGroundTiles = match.data.trackingData.coveredGroundTiles;
            this.addPosIfNew(position, visitedGroundTiles);
            visitedGroundTiles = this.getPlayerStat(match, playerId).coveredGroundTiles;
            this.addPosIfNew(position, visitedGroundTiles);
        }
    }

    updateToggledBridges(match: Match, position: Position): void {
        const visitedBridges = match.data.trackingData.coveredBridges;
        this.addPosIfNew(position, visitedBridges);
    }

    private getPlayerStat(match: Match, playerId: string): TrackingPlayerData {
        return match.data.trackingData.players.find((player) => player.id === playerId);
    }

    private addPosIfNew(targetPosition: Position, visitedPositions: Position[]): void {
        const isNewPosition = !visitedPositions.some((position) => targetPosition.x === position.x && targetPosition.y === position.y);
        if (isNewPosition) {
            visitedPositions.push(targetPosition);
        }
    }
}
