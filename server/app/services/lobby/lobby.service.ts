import { Match } from '@app/classes/match/match';
import { BotService } from '@app/services/bot/bot.service';
import { ChallengeService } from '@app/services/challenge/challenge.service';
import { MapService } from '@app/services/map/map.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { TrackingService } from '@app/services/tracking/tracking.service';
import { UserService } from '@app/services/user/user.service';
import { REGULAR_ITEMS } from '@common/consts/map-data.const';
import { RANDOM_THRESHOLD } from '@common/consts/match-data.const';
import { MIN_PLAYERS } from '@common/consts/player-data.const';
import { DEFAULT_PLAYER_TRACKING_DATA } from '@common/consts/track-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode } from '@common/interfaces/map-data';
import { MatchData, MatchSettings, MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, PlayerData, PlayerType, Team } from '@common/interfaces/player-data';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LobbyService {
    @Inject(TrackingService) private readonly trackingService: TrackingService;
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;
    @Inject(forwardRef(() => BotService)) private readonly botService: BotService;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;
    @Inject(MapService) private readonly mapService: MapService;
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService;
    @Inject(ChallengeService) private readonly challengeService: ChallengeService;

    kickPlayer(match: Match, playerId: string, targetPlayerId: string) {
        if (!match.isHost(playerId) || playerId === targetPlayerId) return;
        this.matchService.refundEntryFeeIfPaid(match, targetPlayerId);
        match.kickPlayer(targetPlayerId, Message.Kick);
        match.sendUpdate();
    }

    changeAvatar(match: Match, playerId: string, avatar: Avatar) {
        const player = match.getPlayer(playerId);
        player.avatar = avatar;
        match.sendUpdate();
    }

    async joinLobby(match: Match, playerId: string, playerData: PlayerData) {
        await (match.isState([MatchState.Lobby])
            ? this.joinLobbyState(match, playerId, playerData)
            : this.joinDropInState(match, playerId, playerData));
    }

    changeLockStatus(match: Match, playerId: string, lockStatus: boolean) {
        if (match.isHost(playerId)) {
            match.changeLockStatus(lockStatus);
            match.sendUpdate();
        }
    }

    changeMatchSettings(match: Match, playerId: string, matchSettings: MatchSettings) {
        if (match.isHost(playerId)) {
            match.changeSettings(matchSettings);
            match.sendUpdate();
        }
    }

    startMatch(match: Match, playerId: string) {
        if (!match.isState([MatchState.Lobby]) || !match.isHost(playerId)) return;
        if (match.data.players.length < MIN_PLAYERS) return match.sendMessageToHost(Message.NotEnoughPlayers);
        if (!match.data.lobbyData.isLocked) return match.sendMessageToHost(Message.NotLocked);
        if (match.data.gameData.mapData.gameMode === GameMode.CTF && match.data.players.length % 2 !== 0) {
            return match.sendMessageToHost(Message.NotEvenPlayers);
        }
        this.startMatchFirstTurn(match);
    }

    addBot(match: Match, botType: PlayerType) {
        if (match.isFull()) return;
        const botData = this.botService.getBotData(match);
        if (!botData) return;
        botData.type = botType;
        match.data.players.push(botData);
        this.matchService.addPlayerToMatchCode(botData.id, match.data.code);
        if (match.isFull()) match.changeLockStatus(true);
        match.sendUpdate();
    }

    getUniqueName(match: Match, playerId: string, name: string): string {
        let newName = name;
        let suffix = 2;
        while (match.data.players.some((p) => p.name === newName && p.id !== playerId)) {
            newName = `${name}-${suffix++}`;
        }
        return newName;
    }

    private async ensureEntryFeePaid(match: Match, playerId: string, userId?: string): Promise<boolean> {
        const entryFee = match.data.lobbyData.entryFee;
        if (entryFee <= 0 || !userId || match.hasPaidEntryFee(userId)) return true;

        const newBalance = await this.userService.deductBalance(userId, entryFee);
        if (newBalance === null) {
            this.matchService.playerRemovedFromMatch(playerId, Message.InsufficientFunds);
            return false;
        }

        match.markEntryFeePaid(userId);
        return true;
    }

    private mergePlayer(existingPlayer: PlayerData, incoming: PlayerData, playerId: string): PlayerData {
        return { ...existingPlayer, ...incoming, id: playerId, isConnected: true };
    }

    private async joinLobbyState(match: Match, playerId: string, playerData: PlayerData) {
        if (!(await this.ensureEntryFeePaid(match, playerId, playerData.userId))) return;

        const placeholderIndex = this.findPlaceholderIndex(match, playerId);
        playerData.name = this.getUniqueName(match, playerId, playerData.name);
        playerData.isConnected = true;

        if (placeholderIndex !== -1) {
            const updatedPlayer = this.mergePlayer(match.data.players[placeholderIndex], playerData, playerId);
            this.registerTrackingPlayer(match, playerId, updatedPlayer);
            match.data.players[placeholderIndex] = updatedPlayer;
        } else {
            this.registerTrackingPlayer(match, playerId, playerData);
            match.data.players.push(playerData);
        }

        match.changeLockStatus(false);
        match.sendUpdate();
    }

    private async joinDropInState(match: Match, playerId: string, playerData: PlayerData) {
        if (!(await this.ensureEntryFeePaid(match, playerId, playerData.userId))) return;

        match.data.players = match.data.players.filter((p) => !(p.id === playerId && !p.name));
        const reconnectUserId = playerData.id?.trim();
        const disconnectedPlayerIndex = reconnectUserId ? this.findDisconnectedPlayerIndexByUserId(match, reconnectUserId) : -1;

        if (disconnectedPlayerIndex !== -1) this.remapReconnectingPlayerSocket(match, disconnectedPlayerIndex, playerId);
        else playerData.name = this.getUniqueName(match, playerId, playerData.name);

        playerData.isConnected = true;
        this.handleDropIn(match, playerId, playerData, disconnectedPlayerIndex);
    }

    private findPlaceholderIndex(match: Match, playerId: string): number {
        return match.data.players.findIndex((player) => player.id === playerId && !player.name);
    }

    private findDisconnectedPlayerIndexByUserId(match: Match, userId: string): number {
        if (!userId) {
            return -1;
        }
        return match.data.players.findIndex((player) => player.id === userId && !player.isConnected);
    }

    private remapReconnectingPlayerSocket(match: Match, disconnectedPlayerIndex: number, newPlayerId: string) {
        const oldPlayerId = match.data.players[disconnectedPlayerIndex].id;
        this.matchService.remapPlayerSocketId(oldPlayerId, newPlayerId, match.data.code);
        const trackingPlayer = match.data.trackingData.players.find((player) => player.id === oldPlayerId);
        if (trackingPlayer) {
            trackingPlayer.id = newPlayerId;
        }
    }

    private startMatchFirstTurn(match: Match) {
        this.assignTeams(match);
        this.sortPlayers(match);
        this.assignSpawnPoints(match);
        this.setupRandomItems(match);
        this.trackingService.startTrackingMatch(match);
        match.data.playData.activePlayerIndex = -1;
        this.playService.startNextTurn(match);
    }

    private assignTeams(match: Match) {
        if (match.data.gameData.mapData.gameMode !== GameMode.CTF) return;
        const shuffled = match.data.players.filter((p) => p.isConnected).sort(() => Math.random() - RANDOM_THRESHOLD);
        const half = shuffled.length / 2;
        shuffled.forEach((player, index) => (player.team = index < half ? Team.Red : Team.Blue));
    }

    private sortPlayers(match: Match): void {
        const hostPlayerId = match.data.players[match.data.lobbyData.hostPlayerIndex].id;
        match.data.players = match.data.players.sort((a: PlayerData, b: PlayerData) => {
            if (a.speed !== b.speed) {
                return b.speed - a.speed;
            }
            return Math.random() - RANDOM_THRESHOLD;
        });
        match.data.lobbyData.hostPlayerIndex = match.getPlayerIndex(hostPlayerId);
    }

    private assignSpawnPoints(match: Match) {
        const spawnPoints = structuredClone(match.data.gameData.mapData.items.Spawn).sort(() => Math.random() - RANDOM_THRESHOLD);
        match.data.gameData.mapData.items.Spawn = spawnPoints.slice(0, match.data.players.length);
        match.setAvailableSpawnPoints(spawnPoints.slice(match.data.players.length));

        match.data.gameData.mapData.items.Spawn.forEach((spawnPoint, i) => {
            const player = match.data.players[i];
            player.spawnPoint = spawnPoint;
            player.position = spawnPoint;
        });
    }

    private handleDropIn(match: Match, playerId: string, playerData: PlayerData, existingIndex: number = -1) {
        const existingPlayer = existingIndex !== -1 ? match.data.players[existingIndex] : undefined;
        if (this.reconnectObserverIfNeeded(match, playerId, existingPlayer)) {
            return;
        }

        const spawnPoint = this.tryGetDropInSpawnPoint(match, playerId);
        if (!spawnPoint) {
            return;
        }

        const storedVictories = this.prepareDropInPlayer(match, playerData, spawnPoint, existingIndex);

        if (this.reconnectExistingPlayerIfNeeded(match, playerId, playerData, existingPlayer, existingIndex, storedVictories)) {
            return;
        }

        this.insertNewDropInPlayer(match, playerData, playerId);
    }

    private reconnectObserverIfNeeded(match: Match, playerId: string, existingPlayer: PlayerData | undefined): boolean {
        if (existingPlayer && existingPlayer.isObserver) {
            existingPlayer.id = playerId;
            existingPlayer.isConnected = true;
            this.registerTrackingPlayer(match, playerId, existingPlayer);
            match.sendUpdate();
            return true;
        }
        return false;
    }

    private tryGetDropInSpawnPoint(match: Match, playerId: string): PlayerData['spawnPoint'] | null {
        if (!match.data.lobbyData.isDropInEnabled) {
            this.matchService.playerRemovedFromMatch(playerId, Message.DropInDisabled);
            return null;
        }

        const spawnPoint = match.getNextAvailableSpawnPoint();
        if (!spawnPoint) {
            this.matchService.playerRemovedFromMatch(playerId, Message.NoAvailableSpawn);
            return null;
        }

        this.addSpawnPointOnMapIfMissing(match, spawnPoint);
        return spawnPoint;
    }

    private addSpawnPointOnMapIfMissing(match: Match, spawnPoint: PlayerData['spawnPoint']) {
        const isSpawnAlreadyOnMap = match.data.gameData.mapData.items.Spawn.some((pos) => pos.x === spawnPoint.x && pos.y === spawnPoint.y);
        if (!isSpawnAlreadyOnMap) {
            match.data.gameData.mapData.items.Spawn.push(structuredClone(spawnPoint));
        }
    }

    private prepareDropInPlayer(
        match: Match,
        playerData: PlayerData,
        spawnPoint: PlayerData['spawnPoint'],
        existingIndex: number,
    ): number | undefined {
        const storedVictories = playerData.userId ? match.getPlayerVictories(playerData.userId) : undefined;
        if (storedVictories !== undefined) {
            playerData.combatsWon = storedVictories;
        } else if (existingIndex === -1) {
            playerData.combatsWon = 0;
        }

        playerData.spawnPoint = structuredClone(spawnPoint);
        const nearestAvailableTile = this.mapService.getNearestEmptyTile(match.data, playerData.spawnPoint, true);
        playerData.position = structuredClone(nearestAvailableTile);
        this.assignDropInTeam(match, playerData);

        return storedVictories;
    }

    private reconnectExistingPlayerIfNeeded(
        match: Match,
        playerId: string,
        playerData: PlayerData,
        existingPlayer: PlayerData | undefined,
        existingIndex: number,
        storedVictories: number | undefined,
    ): boolean {
        if (existingIndex === -1 || !existingPlayer || !playerData.userId || existingPlayer.userId !== playerData.userId) {
            return false;
        }

        const updatedPlayer = this.mergePlayer(existingPlayer, playerData, playerId);
        updatedPlayer.combatsWon = storedVictories ?? existingPlayer.combatsWon;
        updatedPlayer.isObserver = existingPlayer.isObserver;
        match.data.players[existingIndex] = updatedPlayer;

        const insertionIndex = this.getDropInInsertIndex(match, updatedPlayer.speed);
        if (existingIndex !== insertionIndex) {
            match.data.players.splice(existingIndex, 1);
            match.data.players.splice(insertionIndex, 0, updatedPlayer);
            this.updateIndexesAfterDropIn(match, Math.min(existingIndex, insertionIndex));
        }

        this.registerTrackingPlayer(match, playerId, updatedPlayer);
        match.sendUpdate();
        return true;
    }

    private insertNewDropInPlayer(match: Match, playerData: PlayerData, playerId: string) {
        this.registerTrackingPlayer(match, playerId, playerData);
        const insertionIndex = this.getDropInInsertIndex(match, playerData.speed);
        match.data.players.splice(insertionIndex, 0, playerData);
        this.updateIndexesAfterDropIn(match, insertionIndex);
        match.sendUpdate();
    }

    private registerTrackingPlayer(match: Match, playerId: string, playerData: PlayerData) {
        const isValidTile = (pos?: { x: number; y: number }) => !!pos && pos.x >= 0 && pos.y >= 0;
        const trackingPlayerId = playerData.userId ?? playerId;
        const trackingPlayer = match.data.trackingData.players.find((player) => player.id === trackingPlayerId);

        const hasSpawnPoint = isValidTile(playerData.spawnPoint);
        if (trackingPlayer) {
            trackingPlayer.id = trackingPlayerId;
            trackingPlayer.team = playerData.team;

            if (
                isValidTile(playerData.position) &&
                !trackingPlayer.coveredGroundTiles.some((pos) => pos.x === playerData.position.x && pos.y === playerData.position.y)
            ) {
                trackingPlayer.coveredGroundTiles.push(structuredClone(playerData.position));
            }
            if (match.isState([MatchState.Lobby])) {
                trackingPlayer.challenge = this.challengeService.assignChallenge(match.data.gameData.mapData);
            }
            return;
        }
        match.data.trackingData.players.push({
            ...structuredClone(DEFAULT_PLAYER_TRACKING_DATA),
            id: trackingPlayerId,
            name: playerData.name,
            team: playerData.team,
            coveredGroundTiles: hasSpawnPoint ? [playerData.spawnPoint] : structuredClone(DEFAULT_PLAYER_TRACKING_DATA.coveredGroundTiles),
            challenge: this.challengeService.assignChallenge(match.data.gameData.mapData),
        });
    }

    private assignDropInTeam(match: Match, playerData: PlayerData) {
        if (match.data.gameData.mapData.gameMode !== GameMode.CTF) {
            playerData.team = Team.None;
            return;
        }
        const connectedPlayers = match.data.players.filter((player) => player.isConnected && player.team !== Team.None);
        const redCount = connectedPlayers.filter((player) => player.team === Team.Red).length;
        const blueCount = connectedPlayers.filter((player) => player.team === Team.Blue).length;
        playerData.team = redCount <= blueCount ? Team.Red : Team.Blue;
    }

    private getDropInInsertIndex(match: Match, playerSpeed: number): number {
        const index = match.data.players.findIndex((p) => playerSpeed > p.speed);
        return index === -1 ? match.data.players.length : index;
    }

    private updateIndexesAfterDropIn(match: Match, insertIndex: number) {
        if (match.data.lobbyData.hostPlayerIndex >= insertIndex) {
            match.data.lobbyData.hostPlayerIndex++;
        }

        if (match.data.playData.activePlayerIndex >= insertIndex && match.data.playData.activePlayerIndex !== -1) {
            match.data.playData.activePlayerIndex++;
        }

        match.data.combatData.playersCombatData.forEach((playerCombatData) => {
            if (playerCombatData.playerIndex >= insertIndex) {
                playerCombatData.playerIndex++;
            }
        });
    }

    private setupRandomItems(match: Match): void {
        const matchData: MatchData = match.data;
        const items = matchData.gameData.mapData.items;
        const unusedItems = REGULAR_ITEMS.filter((itemType) => !items[itemType]?.length);

        unusedItems.sort(() => Math.random() - RANDOM_THRESHOLD);

        for (let i = 0; i < items[ItemType.Random].length; i++) {
            const itemType = unusedItems[i];
            items[itemType].push(items[ItemType.Random][i]);
        }
        items[ItemType.Random] = [];
    }
}
