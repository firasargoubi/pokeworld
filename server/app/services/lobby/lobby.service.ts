import { Match } from '@app/classes/match/match';
import { BotService } from '@app/services/bot/bot.service';
import { MapService } from '@app/services/map/map.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { TrackingService } from '@app/services/tracking/tracking.service';
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

    kickPlayer(match: Match, playerId: string, targetPlayerId: string) {
        const isHost = match.isHost(playerId);
        const isTryingToKickThemselve = playerId === targetPlayerId;

        if (isHost && !isTryingToKickThemselve) {
            match.kickPlayer(targetPlayerId, Message.Kick);
            match.sendUpdate();
        }
    }

    changeAvatar(match: Match, playerId: string, avatar: Avatar) {
        const player = match.getPlayer(playerId);
        player.avatar = avatar;
        match.sendUpdate();
    }

    joinLobby(match: Match, playerId: string, playerData: PlayerData) {
        const existingIndex = match.data.players.findIndex((p) => p.name === playerData.name);
        if (match.isState([MatchState.Lobby])) match.data.players = match.data.players.filter((p) => p.id !== playerId);
        playerData.name = this.getUniqueName(match, playerId, playerData.name);
        playerData.isConnected = true;
        if (match.isState([MatchState.Lobby])) {
            this.registerTrackingPlayer(match, playerId, playerData);
            match.data.players.push(playerData);
            match.changeLockStatus(false);
            match.sendUpdate();
        } else {
            this.handleDropIn(match, playerId, playerData, existingIndex);
        }
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
        const isInLobby = match.isState([MatchState.Lobby]);
        const hasEnoughPlayers = match.data.players.length >= MIN_PLAYERS;
        const isLocked = match.data.lobbyData.isLocked;
        const isHost = match.isHost(playerId);
        const isEvenPlayers = match.data.players.length % 2 === 0;
        const isCtfMode = match.data.gameData.mapData.gameMode === GameMode.CTF;

        if (isInLobby && isHost) {
            if (!hasEnoughPlayers) {
                match.sendMessageToHost(Message.NotEnoughPlayers);
            } else if (!isLocked) {
                match.sendMessageToHost(Message.NotLocked);
            } else if (isCtfMode && !isEvenPlayers) {
                match.sendMessageToHost(Message.NotEvenPlayers);
            } else {
                this.startMatchFirstTurn(match);
            }
        }
    }

    addBot(match: Match, botType: PlayerType) {
        if (!match.isFull()) {
            const botData = this.botService.getBotData(match);
            if (botData !== null) {
                botData.type = botType;
                match.data.players.push(botData);
                this.matchService.addPlayerToMatchCode(botData.id, match.data.code);
                if (match.isFull()) {
                    match.changeLockStatus(true);
                }
                match.sendUpdate();
            }
        }
    }

    getUniqueName(match: Match, playerId: string, name: string): string {
        let newName = name;
        let suffix = 2;
        while (match.data.players.some((p) => p.name === newName && p.id !== playerId)) {
            newName = `${name}-${suffix}`;
            suffix++;
        }
        return newName;
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
        if (match.data.gameData.mapData.gameMode === GameMode.CTF) {
            const connectedPlayers = match.data.players.filter((p) => p.isConnected);
            const shuffled = connectedPlayers.sort(() => Math.random() - RANDOM_THRESHOLD);
            const half = shuffled.length / 2;

            shuffled.forEach((player, index) => {
                player.team = index < half ? Team.Red : Team.Blue;
            });
        }
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
        const spawnPoints = structuredClone(match.data.gameData.mapData.items.Spawn);
        const shuffledSpawnPoints = spawnPoints.sort(() => Math.random() - RANDOM_THRESHOLD);
        const assignedSpawnPoints = shuffledSpawnPoints.slice(0, match.data.players.length);
        match.setAvailableSpawnPoints(shuffledSpawnPoints.slice(match.data.players.length));
        match.data.gameData.mapData.items.Spawn = assignedSpawnPoints;

        assignedSpawnPoints.forEach((spawnPoint, i) => {
            const player = match.data.players[i];
            player.spawnPoint = spawnPoint;
            player.position = spawnPoint;
        });
    }

    private handleDropIn(match: Match, playerId: string, playerData: PlayerData, existingIndex: number = -1) {
        if (!match.data.lobbyData.isDropInEnabled) {
            this.matchService.playerRemovedFromMatch(playerId, Message.DropInDisabled);
            return;
        }
        const spawnPoint = match.getNextAvailableSpawnPoint();
        if (!spawnPoint) {
            this.matchService.playerRemovedFromMatch(playerId, Message.NoAvailableSpawn);
            return;
        }

        const isSpawnAlreadyOnMap = match.data.gameData.mapData.items.Spawn.some((pos) => pos.x === spawnPoint.x && pos.y === spawnPoint.y);
        if (!isSpawnAlreadyOnMap) {
            match.data.gameData.mapData.items.Spawn.push(structuredClone(spawnPoint));
        }
        const storedVictories = match.getPlayerVictories(playerId);
        if (storedVictories !== undefined) {
            playerData.combatsWon = storedVictories;
        }
        playerData.spawnPoint = structuredClone(spawnPoint);
        const nearestAvailableTile = this.mapService.getNearestEmptyTile(match.data, playerData.spawnPoint);
        playerData.position = structuredClone(nearestAvailableTile);
        this.assignDropInTeam(match, playerData);

        if (existingIndex !== -1) {
            const existingPlayer = match.data.players[existingIndex];
            const updatedPlayer: PlayerData = {
                ...existingPlayer,
                ...playerData,
                id: playerId,
                isConnected: true,
            };
            match.data.players[existingIndex] = updatedPlayer;
            this.registerTrackingPlayer(match, playerId, updatedPlayer);
            match.sendUpdate();
            return;
        }
        this.registerTrackingPlayer(match, playerId, playerData);
        const insertionIndex = this.getDropInInsertIndex(match, playerData.speed);
        match.data.players.splice(insertionIndex, 0, playerData);
        this.updateIndexesAfterDropIn(match, insertionIndex);
        match.sendUpdate();
    }

    private registerTrackingPlayer(match: Match, playerId: string, playerData: PlayerData) {
        const hasSpawnPoint = playerData.spawnPoint && playerData.spawnPoint.x >= 0 && playerData.spawnPoint.y >= 0;
        match.data.trackingData.players = match.data.trackingData.players.filter((player) => player.id !== playerId);
        match.data.trackingData.players.push({
            ...structuredClone(DEFAULT_PLAYER_TRACKING_DATA),
            id: playerId,
            name: playerData.name,
            team: playerData.team,
            coveredGroundTiles: hasSpawnPoint ? [playerData.spawnPoint] : structuredClone(DEFAULT_PLAYER_TRACKING_DATA.coveredGroundTiles),
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
        for (let i = 0; i < match.data.players.length; i++) {
            if (playerSpeed > match.data.players[i].speed) {
                return i;
            }
        }
        return match.data.players.length;
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
        const unusedItems = REGULAR_ITEMS.filter((itemType) => {
            return !items[itemType] || items[itemType].length === 0;
        });

        unusedItems.sort(() => Math.random() - RANDOM_THRESHOLD);

        for (let i = 0; i < items[ItemType.Random].length; i++) {
            const itemType = unusedItems[i];
            items[itemType].push(items[ItemType.Random][i]);
        }
        items[ItemType.Random] = [];
    }
}
