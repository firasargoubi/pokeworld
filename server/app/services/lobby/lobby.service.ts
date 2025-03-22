import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { MAX_PLAYERS, MIN_PLAYERS } from '@common/consts/player.const';
import { GameData } from '@common/interfaces/game-data';
import { Match } from '@common/interfaces/match';
import { Player } from '@common/interfaces/player';
import { Warning } from '@common/interfaces/warning.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LobbyService {
    @Inject(forwardRef(() => LobbyGateway)) private readonly lobbyGateway: LobbyGateway;
    @Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService;
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

    createMatch(playerId: string, gameData: GameData): string {
        let matchCode = '';
        const isPlayerInMatch = this.matchService.isPlayerInMatch(playerId);

        if (!isPlayerInMatch) {
            matchCode = this.matchService.createMatch(gameData);
            this.matchService.addPlayerToMatch(playerId, matchCode, true);
            this.lobbyGateway.connectPlayer(playerId, matchCode);
            this.emitUpdatePlayerList(matchCode);
        } else {
            this.lobbyGateway.warn(playerId, Warning.AlreadyInMatch);
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
        const matchCode = this.matchService.getMatchCode(playerId);
        this.lobbyGateway.disconnectPlayer(playerId);
        const isMatchStarted = this.matchService.getIsMatchStarted(matchCode);

        if (matchCode) {
            if (isMatchStarted) {
                this.leaveStartedMatch(playerId, matchCode);
            } else {
                this.leaveNotStartedMatch(playerId, matchCode);
            }
        }
    }

    leaveStartedMatch(playerId: string, matchCode: string) {
        const match = this.matchService.getMatch(matchCode);
        const player = match.matchData.players.find((p) => p.id === playerId);
        if (player) {
            player.isConnected = false;
            player.currentStats.position = { x: -2, y: -2 };
            player.spawnPoint = { x: -2, y: -2 };
        }
        if (this.hasEnoughPlayer(match)) {
            if (player.isAdmin && match.matchData.isDebugMode) {
                this.playService.changeDebugMode(playerId, false);
            }
            this.matchService.removePlayerFromMatch(playerId, matchCode, false);
            this.lobbyGateway.emitPlayerLeft(matchCode, { match, playerName: player.name });
            if (this.playService.canEndTurn(playerId, matchCode)) {
                this.playService.nextTurnPhase(match.matchData.code);
            }
        }
    }

    leaveNotStartedMatch(playerId: string, matchCode: string) {
        const isAdmin = this.matchService.isPlayerAdmin(playerId, matchCode);
        this.matchService.removePlayerFromMatch(playerId, matchCode, true);

        if (isAdmin) {
            this.kickAllPlayers(matchCode);
        } else {
            this.emitUpdatePlayerList(matchCode);
            this.emitLockStatusChanged(matchCode);
        }
    }

    kickPlayer(currentPlayerId: string, targetPlayerId: string) {
        const matchCode = this.matchService.getMatchCode(currentPlayerId);
        const isAdmin = this.matchService.isPlayerAdmin(currentPlayerId, matchCode);
        const isTryingToKickThemselve = currentPlayerId === targetPlayerId;

        if (isAdmin && !isTryingToKickThemselve) {
            this.removePlayer(matchCode, targetPlayerId, Warning.Kick);
        }
    }

    removePlayer(matchCode: string, targetPlayerId: string, warning: Warning) {
        this.matchService.removePlayerFromMatch(targetPlayerId, matchCode, true);
        this.lobbyGateway.warn(targetPlayerId, warning);
        this.lobbyGateway.disconnectPlayer(targetPlayerId);
        this.emitUpdatePlayerList(matchCode);
        this.emitLockStatusChanged(matchCode);
    }

    updatePlayer(playerId: string, updatedFields: Partial<Player>) {
        const matchCode = this.matchService.getMatchCode(playerId);
        const players = this.matchService.getPlayers(matchCode);
        const player = players.find((p) => p.id === playerId);

        Object.assign(player, updatedFields);
        if (updatedFields.name) {
            player.name = this.matchService.getUniqueName(updatedFields.name, playerId, matchCode);
        }
        if (updatedFields.isConnected) {
            const gameData = this.matchService.getMatch(matchCode).gameData;
            this.lobbyGateway.emitGameDataToPlayer(playerId, gameData);

            this.emitLockStatusChanged(matchCode);
        }

        this.emitUpdatePlayerList(matchCode);
    }

    startMatch(playerId: string) {
        const matchCode = this.matchService.getMatchCode(playerId);
        const canStartMatch = this.canStartMatch(matchCode, playerId);
        if (canStartMatch) {
            this.playService.startMatch(matchCode);
        }
    }

    changeLockStatus(playerId: string, isLocked: boolean) {
        const matchCode = this.matchService.getMatchCode(playerId);
        const isAdmin = this.matchService.isPlayerAdmin(playerId, matchCode);

        if (isAdmin) {
            this.matchService.setMatchLockState(matchCode, isLocked);
            this.emitLockStatusChanged(matchCode);
        }
    }

    private hasEnoughPlayer(match: Match): boolean {
        const connectedPlayers = match.matchData.players.filter((p) => p.isConnected);
        const hasEnoughPlayer = connectedPlayers.length > 1;

        if (!hasEnoughPlayer) {
            this.lobbyGateway.disconnectPlayer(connectedPlayers[0].id);
            this.lobbyGateway.warn(connectedPlayers[0].id, Warning.LastPlayerRemaining);
            match.matchData.players.forEach((p) => {
                this.matchService.removePlayerFromMatch(p.id, match.matchData.code, true);
            });
        }

        return hasEnoughPlayer;
    }

    private kickAllPlayers(matchCode: string) {
        const players = this.matchService.getPlayers(matchCode);
        players.forEach((player) => {
            this.matchService.removePlayerFromMatch(player.id, matchCode, true);
            this.lobbyGateway.disconnectPlayer(player.id);
            this.lobbyGateway.warn(player.id, Warning.AdminQuit);
        });
    }

    private canPlayerJoinMatch(playerId: string, matchCode: string): boolean {
        let result = true;

        if (!this.matchService.hasMatchCode(matchCode)) {
            this.lobbyGateway.warn(playerId, Warning.InvalidMatchCode);
            result = false;
        } else if (this.isMatchFull(matchCode)) {
            this.lobbyGateway.warn(playerId, Warning.RoomFull);
            result = false;
        } else if (this.isMatchLocked(matchCode)) {
            this.lobbyGateway.warn(playerId, Warning.RoomLocked);
            result = false;
        } else if (this.matchService.isPlayerInMatch(playerId)) {
            this.lobbyGateway.warn(playerId, Warning.AlreadyInMatch);
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
                this.removePlayer(matchCode, player.id, Warning.LockedFromLobby);
            }
        });
    }

    private emitUpdatePlayerList(matchCode: string): void {
        const players = this.matchService.getPlayers(matchCode);
        this.lobbyGateway.emitUpdatePlayerList(matchCode, players);
    }

    private canStartMatch(matchCode: string, playerId: string): boolean {
        let canStartMatch = false;
        if (matchCode) {
            const match = this.matchService.getMatch(matchCode);
            const currentPlayerCount = match.matchData.players.length;
            const isAdmin = this.matchService.isPlayerAdmin(playerId, matchCode);
            const isMatchLocked = !this.canJoinMatch(matchCode);
            const hasEnoughPlayers = currentPlayerCount >= MIN_PLAYERS;
            const areAllPlayersConnected = match.matchData.players.every((p: Player) => p.isConnected);
            canStartMatch = isAdmin && isMatchLocked && hasEnoughPlayers && areAllPlayersConnected;
        }
        return canStartMatch;
    }

    private isMatchFull(matchCode: string): boolean {
        let isMatchFull = true;
        const match = this.matchService.getMatch(matchCode);
        if (match) {
            const maxPlayerCount = MAX_PLAYERS[match.gameData.mapData.size];
            const currentPlayerCount = match.matchData.players.filter((player: Player) => player.isConnected).length;
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
}
