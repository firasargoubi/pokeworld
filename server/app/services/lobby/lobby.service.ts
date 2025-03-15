import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MatchService } from '@app/services/match/match.service';
import { GameService } from '@app/services/game/game.service';
import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';
import { Player } from '@common/player';
import { HALF_POINT, MAX_PLAYERS, MIN_PLAYERS } from './lobby.service.const';

@Injectable()
export class LobbyService {
    @Inject(forwardRef(() => LobbyGateway)) private readonly lobbyGateway: LobbyGateway;
    @Inject(GameService) private readonly gameService: GameService;
    @Inject(MatchService) private readonly matchService: MatchService;

    async createMatch(playerId: string, gameId: string): Promise<string> {
        let matchCode = '';
        const gameData = await this.gameService.getGameData(gameId);
        const isPlayerInMatch = this.matchService.isPlayerInMatch(playerId);

        if (gameData._id && gameData.isVisible && !isPlayerInMatch) {
            matchCode = this.matchService.createMatch(gameData);
            this.matchService.addPlayerToMatch(playerId, matchCode, true);
            this.lobbyGateway.connectPlayer(playerId, matchCode);
        }

        return matchCode;
    }

    joinMatch(playerId: string, matchCode: string) {
        const canJoin = !this.isMatchLocked(matchCode);

        if (canJoin) {
            this.matchService.addPlayerToMatch(playerId, matchCode, false);
            this.lobbyGateway.connectPlayer(playerId, matchCode);
            this.emitUpdatePlayerList(matchCode);
            this.emitLockStatusChanged(matchCode);
        }

        return canJoin;
    }

    leaveMatch(playerId: string) {
        this.lobbyGateway.disconnectPlayer(playerId);
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const isMatchStarted = this.matchService.getIsMatchStarted(matchCode);

        if (matchCode && !isMatchStarted) {
            if (this.matchService.isPlayerAdmin(matchCode)) {
                const players = this.matchService.getPlayers(matchCode);
                players.forEach((player) => {
                    if (player.id !== playerId) {
                        this.matchService.removePlayerFromMatch(player.id, matchCode);
                        this.lobbyGateway.disconnectPlayer(player.id);
                        this.lobbyGateway.emitRemovedFromMatch(player.id);
                    }
                });
            } else {
                this.matchService.removePlayerFromMatch(playerId, matchCode);
                this.emitUpdatePlayerList(matchCode);
                this.emitLockStatusChanged(matchCode);
            }
        }
    }

    tryKickPlayer(playerId: string, targetPlayerId: string) {
        const isAdmin = this.matchService.isPlayerAdmin(playerId);
        const isTryingToKickThemselve = targetPlayerId === playerId;

        if (isAdmin && !isTryingToKickThemselve) {
            this.kickPlayer(targetPlayerId);
        }
    }

    kickPlayer(playerId: string) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);

        this.matchService.removePlayerFromMatch(playerId, matchCode);
        this.lobbyGateway.emitRemovedFromMatch(playerId);
        this.lobbyGateway.disconnectPlayer(playerId);
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

    private emitLockStatusChanged(matchCode: string): void {
        const lockedStatus = this.isMatchLocked(matchCode);
        if (lockedStatus) {
            this.kickJoiningPlayers(matchCode);
        }
        this.lobbyGateway.emitLockStatusChanged(matchCode, lockedStatus);
    }

    private kickJoiningPlayers(matchCode: string) {
        const players = this.matchService.getPlayers(matchCode);
        players.forEach((player) => {
            if (!player.isConnected) {
                this.kickPlayer(player.id);
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
        const isMatchLocked = this.isMatchLocked(matchCode);
        const hasEnoughPlayers = currentPlayerCount >= MIN_PLAYERS;
        const areAllPlayersConnected = match.matchData.players.every((p) => p.isConnected);

        return isAdmin && isMatchLocked && hasEnoughPlayers && areAllPlayersConnected;
    }

    private isMatchLocked(matchCode: string): boolean {
        let isMatchLocked = true;

        const match = this.matchService.getMatch(matchCode);
        if (match) {
            const maxPlayerCount = MAX_PLAYERS[match.gameData.mapData.size];
            const currentPlayerCount = match.matchData.players.filter((player) => player.isConnected).length;
            const isMatchFull = currentPlayerCount >= maxPlayerCount;
            isMatchLocked = match.matchData.isLocked || isMatchFull;
        }

        return isMatchLocked;
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
