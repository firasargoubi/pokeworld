import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';
import { MatchService } from '@app/services/match/match.service';
import { GameData } from '@common/game-data';
import { MAX_PLAYERS } from '@common/max-players.const';
import { Player } from '@common/player';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HALF_POINT, MIN_PLAYERS } from './lobby.service.const';
import { Warning } from '@common/warning.enum';

@Injectable()
export class LobbyService {
    @Inject(forwardRef(() => LobbyGateway)) private readonly lobbyGateway: LobbyGateway;
    @Inject(MatchService) private readonly matchService: MatchService;

    createMatch(playerId: string, gameData: GameData): string {
        let matchCode = '';
        const isPlayerInMatch = this.matchService.isPlayerInMatch(playerId);

        if (!isPlayerInMatch) {
            matchCode = this.matchService.createMatch(gameData);
            this.matchService.addPlayerToMatch(playerId, matchCode, true);
            this.lobbyGateway.connectPlayer(playerId, matchCode);
            this.emitUpdatePlayerList(matchCode);
        } else {
            this.lobbyGateway.warn(playerId, 'Vous êtes déjà dans une partie');
        }

        return matchCode;
    }

    joinMatch(playerId: string, matchCode: string): boolean {
        const canJoinMatch = this.canPlayerJoinMatch(playerId, matchCode);

        if (canJoinMatch) {
            this.matchService.addPlayerToMatch(playerId, matchCode, false);
            this.lobbyGateway.connectPlayer(playerId, matchCode);
            this.emitUpdatePlayerList(matchCode);
            this.emitLockStatusChanged(matchCode);
        }

        return canJoinMatch;
    }

    leaveMatch(playerId: string) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const isMatchStarted = this.matchService.getIsMatchStarted(matchCode);
        const isAdmin = this.matchService.isPlayerAdmin(playerId);

        this.lobbyGateway.disconnectPlayer(playerId);
        this.matchService.removePlayerFromMatch(playerId, matchCode);

        if (matchCode && !isMatchStarted) {
            if (isAdmin) {
                this.kickAllPlayers(matchCode);
            } else {
                this.emitUpdatePlayerList(matchCode);
                this.emitLockStatusChanged(matchCode);
            }
        }
    }

    kickPlayer(currentPlayerId: string, targetPlayerId: string) {
        const isAdmin = this.matchService.isPlayerAdmin(currentPlayerId);
        const isTryingToKickThemselve = currentPlayerId === targetPlayerId;

        if (isAdmin && !isTryingToKickThemselve) {
            this.removePlayer(targetPlayerId, Warning.Kick);
        }
    }

    removePlayer(targetPlayerId: string, removalReason: Warning) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(targetPlayerId);

        this.matchService.removePlayerFromMatch(targetPlayerId, matchCode);
        this.lobbyGateway.emitRemovedFromMatch(targetPlayerId, removalReason);
        this.lobbyGateway.disconnectPlayer(targetPlayerId);
        this.emitUpdatePlayerList(matchCode);
        this.emitLockStatusChanged(matchCode);
    }

    updatePlayer(playerId: string, updatedFields: Partial<Player>) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const players = this.matchService.getPlayers(matchCode);
        const player = players.find((p) => p.id === playerId);

        Object.assign(player, updatedFields);
        if (updatedFields.name) {
            player.name = this.matchService.getUniqueName(updatedFields.name, playerId);
        }
        if (updatedFields.isConnected) {
            const gameData = this.matchService.getMatch(matchCode).gameData;
            this.lobbyGateway.emitGameDataToPlayer(playerId, gameData);

            this.emitLockStatusChanged(matchCode);
        }

        this.emitUpdatePlayerList(matchCode);
    }

    startMatch(playerId: string) {
        const canStartMatch = this.canStartMatch(playerId);
        if (canStartMatch) {
            const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
            this.sanitizeMatch(matchCode);
            const match = this.matchService.getMatch(matchCode);
            this.lobbyGateway.emitMatchStarted(matchCode, match);
        }
    }

    changeLockStatus(playerId: string, isLocked: boolean) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const isAdmin = this.matchService.isPlayerAdmin(playerId);

        if (isAdmin) {
            this.matchService.setMatchLockState(matchCode, isLocked);
            this.emitLockStatusChanged(matchCode);
        }
    }

    private kickAllPlayers(matchCode: string) {
        const players = this.matchService.getPlayers(matchCode);
        players.forEach((player) => {
            this.matchService.removePlayerFromMatch(player.id, matchCode);
            this.lobbyGateway.disconnectPlayer(player.id);
            this.lobbyGateway.emitRemovedFromMatch(player.id, Warning.AdminQuit);
        });
    }

    private canPlayerJoinMatch(playerId: string, matchCode: string): boolean {
        let result = true;

        if (!this.matchService.hasMatchCode(matchCode)) {
            this.lobbyGateway.warn(playerId, Warning.NotExistGame);
            result = false;
        } else if (this.isMatchFull(matchCode)) {
            this.lobbyGateway.warn(playerId, Warning.RoomFull);
            result = false;
        } else if (this.isMatchLocked(matchCode)) {
            this.lobbyGateway.warn(playerId, Warning.RoomLocked);
            result = false;
        } else if (this.matchService.isPlayerInMatch(playerId)) {
            this.lobbyGateway.warn(playerId, Warning.AlreadyInGame);
            result = false;
        }

        return result;
    }

    private emitLockStatusChanged(matchCode: string): void {
        const isLocked = !this.canJoinMatch(matchCode);
        if (isLocked) {
            this.kickJoiningPlayers(matchCode);
        }
        this.lobbyGateway.emitLockStatusChanged(matchCode, isLocked);
    }

    private kickJoiningPlayers(matchCode: string) {
        const players = this.matchService.getPlayers(matchCode);
        players.forEach((player) => {
            if (!player.isConnected) {
                this.removePlayer(player.id, Warning.RoomLocked);
            }
        });
    }

    private emitUpdatePlayerList(matchCode: string): void {
        const players = this.matchService.getPlayers(matchCode);
        this.lobbyGateway.emitUpdatePlayerList(matchCode, players);
    }

    private canStartMatch(playerId: string): boolean {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const match = this.matchService.getMatch(matchCode);
        const currentPlayerCount = match.matchData.players.length;

        const isAdmin = this.matchService.isPlayerAdmin(playerId);
        const isMatchLocked = !this.canJoinMatch(matchCode);
        const hasEnoughPlayers = currentPlayerCount >= MIN_PLAYERS;
        const areAllPlayersConnected = match.matchData.players.every((p) => p.isConnected);

        return isAdmin && isMatchLocked && hasEnoughPlayers && areAllPlayersConnected;
    }

    private isMatchFull(matchCode: string): boolean {
        let isMatchFull = true;
        const match = this.matchService.getMatch(matchCode);
        if (match) {
            const maxPlayerCount = MAX_PLAYERS[match.gameData.mapData.size];
            const currentPlayerCount = match.matchData.players.filter((player) => player.isConnected).length;
            isMatchFull = currentPlayerCount >= maxPlayerCount;
        }
        return isMatchFull;
    }

    private isMatchLocked(matchCode: string): boolean {
        let isMatchLocked = false;
        const match = this.matchService.getMatch(matchCode);
        if (match) {
            isMatchLocked = match.matchData.isLocked;
        }
        return isMatchLocked;
    }

    private canJoinMatch(matchCode: string): boolean {
        return !this.isMatchFull(matchCode) && !this.isMatchLocked(matchCode);
    }

    private sanitizeMatch(matchCode: string) {
        const match = this.matchService.getMatch(matchCode);
        match.matchData.isStarted = true;
        match.matchData.players = match.matchData.players.sort((a: Player, b: Player) => {
            if (a.playerStats.speed !== b.playerStats.speed) {
                return b.playerStats.speed - a.playerStats.speed;
            }
            return Math.random() - HALF_POINT;
        });
    }
}
