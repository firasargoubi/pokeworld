import { Match } from '@app/classes/match/match';
import { CombatService } from '@app/services/combat/combat.service';
import { CHALLENGE_DUELIST_MIN_HP } from '@common/consts/challenge-data.const';
import { DEFAULT_PLAYER_TRACKING_DATA } from '@common/consts/track-data.const';
import { ChallengeType, PlayerChallengeData } from '@common/interfaces/challenge-data';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode } from '@common/interfaces/map-data';
import { PlayerCombatData } from '@common/interfaces/match-data';
import { PlayerData } from '@common/interfaces/player-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { TrackingPlayerData } from '@common/interfaces/track-data';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TrackingService {
    @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService;

    startTrackingMatch(match: Match) {
        match.data.players.forEach((player) => {
            match.data.trackingData.coveredGroundTiles.push(player.position);
        });
        match.data.trackingData.startTime = Date.now();
        match.data.trackingData.players = match.data.players.map((player) => ({
            ...structuredClone(DEFAULT_PLAYER_TRACKING_DATA),
            id: this.getTrackingId(player),
            name: player.name,
            team: player.team,
            coveredGroundTiles: [player.spawnPoint],
            challenge: match.data.trackingData.players.find((p) => p.id === this.getTrackingId(player))?.challenge ?? null,
        }));
    }

    stopTrackingMatch(match: Match) {
        match.data.trackingData.endTime = Date.now();
        match.data.trackingData.players.forEach((player) => {
            player.challenge = this.evaluateChallengeProgress(player);
        });
    }

    updateHps(match: Match, attackResult: number) {
        const attacked = this.combatService.getInactivePlayerData(match);
        const attacker = this.combatService.getActivePlayerData(match);
        const attackedId = match.data.players[attacked.playerIndex].id;
        this.getPlayerStat(match, attackedId).hpLost += Math.min(attackResult, attacked.currentHealth);
        const attackerId = match.data.players[attacker.playerIndex].id;
        this.getPlayerStat(match, attackerId).hpInflicted += Math.min(attackResult, attacked.currentHealth);
    }

    updateEscapes(match: Match, player: PlayerCombatData) {
        const escaperId = match.data.players[player.playerIndex].id;
        this.getPlayerStat(match, escaperId).escapes++;
    }

    updateCombats(match: Match, winner: PlayerCombatData, loser: PlayerCombatData) {
        const winnerId = match.data.players[winner.playerIndex].id;
        const loserId = match.data.players[loser.playerIndex].id;
        const winnerStat = this.getPlayerStat(match, winnerId);
        const loserStat = this.getPlayerStat(match, loserId);
        winnerStat.victories++;
        loserStat.defeats++;
        winnerStat.combats++;
        loserStat.combats++;
        const duelChallenge = winnerStat.challenge;
        if (duelChallenge?.type === ChallengeType.Duelist && !duelChallenge.isCompleted && winner.currentHealth >= CHALLENGE_DUELIST_MIN_HP) {
            duelChallenge.progress = duelChallenge.target;
        }
        this.evaluateChallengeProgress(winnerStat);
        this.evaluateChallengeProgress(loserStat);
    }

    updateRounds(match: Match) {
        ++match.data.trackingData.rounds;
    }

    updateWinner(match: Match, winner: PlayerData) {
        const standingTile = match.data.gameData.mapData.tiles[winner.position.x][winner.position.y];
        const name = match.data.gameData.mapData.gameMode === GameMode.FFA ? winner.name : winner.team;
        match.data.trackingData.matchWinner = { id: this.getTrackingId(winner), avatar: winner.avatar, name, tile: standingTile };
    }

    updateItems(match: Match, item: ItemType, playerId: string) {
        const playerStat = this.getPlayerStat(match, playerId);
        const itemList = playerStat.pickedUpItems;
        const isNewItem = !itemList.includes(item);
        if (isNewItem) {
            const gameMode = match.data.gameData.mapData.gameMode;
            if (gameMode === GameMode.CTF && item === ItemType.Flag) {
                match.data.trackingData.flagHoldersCount++;
            }
            itemList.push(item);
            this.evaluateChallengeProgress(playerStat);
        }
    }

    updateGroundTiles(match: Match, positions: Position[], playerId: string) {
        const tilePositions = match.data.gameData.mapData.tiles;
        const playerStat = this.getPlayerStat(match, playerId);
        for (const position of positions) {
            const targetTile = tilePositions[position.x][position.y];
            if (targetTile !== TileType.Bridge) {
                let visitedGroundTiles = match.data.trackingData.coveredGroundTiles;
                this.addPosIfNew(position, visitedGroundTiles);
                visitedGroundTiles = playerStat.coveredGroundTiles;
                this.addPosIfNew(position, visitedGroundTiles);
            }
        }
        this.evaluateChallengeProgress(playerStat);
    }

    updateToggledBridges(match: Match, position: Position, playerId?: string) {
        const visitedBridges = match.data.trackingData.coveredBridges;
        this.addPosIfNew(position, visitedBridges);
        if (playerId) {
            const playerStat = this.getPlayerStat(match, playerId);
            playerStat.toggledBridgesCount++;
            this.evaluateChallengeProgress(playerStat);
        }
    }

    private evaluateChallengeProgress(playerStat: TrackingPlayerData): PlayerChallengeData {
        const challenge = playerStat.challenge;
        if (!challenge) return;

        switch (challenge.type) {
            case ChallengeType.Explorer:
                challenge.progress = playerStat.coveredGroundTiles.length;
                break;
            case ChallengeType.Invincible:
                challenge.progress = playerStat.combats >= 1 && playerStat.defeats === 0 ? 1 : 0;
                break;
            case ChallengeType.Collector:
                if (challenge.isCompleted) break;
                challenge.progress = playerStat.pickedUpItems.length;
                break;
            case ChallengeType.BridgeWalker:
                challenge.progress = Math.min(playerStat.toggledBridgesCount, challenge.target);
                break;
        }

        challenge.isCompleted = challenge.progress >= challenge.target;
        return challenge;
    }

    private getPlayerStat(match: Match, playerId: string): TrackingPlayerData {
        const trackedPlayerId = match.getPlayer(playerId)?.userId ?? playerId;
        return match.data.trackingData.players.find((player) => player.id === trackedPlayerId);
    }

    private getTrackingId(player: PlayerData): string {
        return player.userId ?? player.id;
    }

    private addPosIfNew(targetPosition: Position, visitedPositions: Position[]) {
        const isNewPosition = !visitedPositions.some((position) => targetPosition.x === position.x && targetPosition.y === position.y);
        if (isNewPosition) {
            visitedPositions.push(targetPosition);
        }
    }
}
