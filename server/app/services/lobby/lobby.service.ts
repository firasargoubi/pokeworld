import { Match } from '@app/classes/match/match';
import { PlayService } from '@app/services/play/play.service';
import { HALF_POINT } from '@common/consts/match-data.const';
import { MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, PlayerData } from '@common/interfaces/player-data';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LobbyService {
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

    kickPlayer(match: Match, playerId: string, targetPlayerId: string) {
        const isHost = match.isHost(playerId);
        const isTryingToKickThemselve = playerId === targetPlayerId;

        if (isHost && !isTryingToKickThemselve) {
            match.kickPlayer(targetPlayerId, Message.Kick);
            match.changeLockStatus(false);
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
        const isInLobby = match.data.state === MatchState.Lobby;
        const isLocked = match.data.lobbyData.isLocked;
        const isHost = match.isHost(playerId);
        if (isInLobby && isLocked && isHost) {
            this.startMatchFirstTurn(match);
        }
    }

    private startMatchFirstTurn(match: Match) {
        this.sortPlayers(match);
        this.assignSpawnPoints(match);
        // this.playService.startTurn(match, 0);
        // TODO
    }

    private sortPlayers(match: Match) {
        const hostPlayerId = match.data.players[match.data.lobbyData.hostPlayerIndex].id;
        match.data.players = match.data.players.sort((a: PlayerData, b: PlayerData) => {
            if (a.speed !== b.speed) {
                return b.speed - a.speed;
            }
            return Math.random() - HALF_POINT;
        });
        match.data.lobbyData.hostPlayerIndex = match.data.players.findIndex((p) => p.id === hostPlayerId);
    }

    private assignSpawnPoints(match: Match) {
        const spawnPoints = match.data.gameData.mapData.items.Spawn;
        const shuffledSpawnPoints = spawnPoints.sort(() => Math.random() - HALF_POINT).slice(0, match.data.players.length);
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
}
