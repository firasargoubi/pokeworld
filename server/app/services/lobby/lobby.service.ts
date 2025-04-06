import { Match } from '@app/classes/match/match';
import { PlayService } from '@app/services/play/play.service';
import { AVATAR_DATA, MAX_SELECTABLE_AVATAR_INDEX, MIN_SELECTABLE_AVATAR_INDEX } from '@common/consts/avatar-data.const';
import { BONUS_STAT, DEFAULT_PLAYER_DATA, DEFAULT_STAT, MIN_PLAYERS } from '@common/consts/player-data.const';
import { REGULAR_ITEMS } from '@common/consts/map-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, DiceType, PlayerData, PlayerType } from '@common/interfaces/player-data';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RANDOM_THRESHOLD } from '@common/consts/match-data.const';

@Injectable()
export class LobbyService {
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

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
        match.data.players = match.data.players.filter((p) => p.id !== playerId);
        playerData.name = this.getUniqueName(match, playerId, playerData.name);
        playerData.isConnected = true;
        match.data.players.push(playerData);
        match.changeLockStatus(false);
        match.sendUpdate();
    }

    changeLockStatus(match: Match, playerId: string, lockStatus: boolean) {
        if (match.isHost(playerId)) {
            match.changeLockStatus(lockStatus);
            match.sendUpdate();
        }
    }

    startMatch(match: Match, playerId: string) {
        const isInLobby = match.isState([MatchState.Lobby]);
        const hasEnoughPlayers = match.data.players.length >= MIN_PLAYERS;
        const isLocked = match.data.lobbyData.isLocked;
        const isHost = match.isHost(playerId);
        if (isInLobby && hasEnoughPlayers && isLocked && isHost) {
            this.startMatchFirstTurn(match);
        }
    }

    addBot(match: Match, botType: PlayerType) {
        if (!match.isFull()) {
            const botData = this.getBotData(match);
            if (botData !== null) {
                botData.type = botType;
                match.data.players.push(botData);
                match.changeLockStatus(false);
                match.sendUpdate();
            }
        }
    }

    private getBotData(match: Match): PlayerData | null {
        let botData = null;
        const avatar = this.getBotAvatar(match);
        if (avatar !== null) {
            const hasStrongAttack = Math.random() < RANDOM_THRESHOLD;
            const hasStrongSpeed = Math.random() < RANDOM_THRESHOLD;
            const id = this.getBotId();
            botData = {
                ...DEFAULT_PLAYER_DATA,
                id,
                isConnected: true,
                avatar,
                name: this.getUniqueName(match, id, AVATAR_DATA[avatar].name.toUpperCase()),
                attackDice: hasStrongAttack ? DiceType.D6 : DiceType.D4,
                defenseDice: hasStrongAttack ? DiceType.D4 : DiceType.D6,
                health: hasStrongSpeed ? DEFAULT_STAT : BONUS_STAT,
                speed: hasStrongSpeed ? BONUS_STAT : DEFAULT_STAT,
            };
        }
        return botData;
    }

    private getBotAvatar(match: Match): Avatar | null {
        let botAvatar = null;
        const lockedAvatars = match.data.players.map((p) => p.avatar);
        const unlockedAvatars = Object.values(Avatar)
            .slice(MIN_SELECTABLE_AVATAR_INDEX, MAX_SELECTABLE_AVATAR_INDEX)
            .filter((avatar) => !lockedAvatars.includes(avatar));

        if (unlockedAvatars.length > 0) {
            const randomIndex = Math.floor(Math.random() * (unlockedAvatars.length - 1)) + 1;
            botAvatar = unlockedAvatars[randomIndex];
        }
        return botAvatar;
    }

    private startMatchFirstTurn(match: Match) {
        this.sortPlayers(match);
        this.assignSpawnPoints(match);
        this.setupRandomItems(match);
        match.data.playData.activePlayerIndex = -1;
        this.playService.startNextTurn(match);
    }

    private getBotId(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = 8;
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    }

    private sortPlayers(match: Match) {
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
        const spawnPoints = match.data.gameData.mapData.items.Spawn;
        const shuffledSpawnPoints = spawnPoints.sort(() => Math.random() - RANDOM_THRESHOLD).slice(0, match.data.players.length);
        match.data.gameData.mapData.items.Spawn = spawnPoints.filter((s) => shuffledSpawnPoints.includes(s));

        shuffledSpawnPoints.forEach((spawnPoint, i) => {
            match.data.players[i].spawnPoint = spawnPoint;
            match.data.players[i].position = spawnPoint;
        });
    }

    private getUniqueName(match: Match, playerId: string, name: string): string {
        let newName = name;
        let suffix = 2;
        while (match.data.players.some((p) => p.name === newName && p.id !== playerId)) {
            newName = `${name}-${suffix}`;
            suffix++;
        }
        return newName;
    }

    private setupRandomItems(match: Match): void {
        const matchData: MatchData = match.data;
        const items = matchData.gameData.mapData.items;
        const unusedItems = REGULAR_ITEMS.filter((itemType) => {
            return !items[itemType] || items[itemType].length === 0;
        });

        const randomThreshold = 0.5;
        unusedItems.sort(() => Math.random() - randomThreshold);

        for (let i = 0; i < items[ItemType.Random].length; i++) {
            const itemType = unusedItems[i];
            items[itemType].push(items[ItemType.Random][i]);
        }
        items[ItemType.Random] = [];
    }
}
