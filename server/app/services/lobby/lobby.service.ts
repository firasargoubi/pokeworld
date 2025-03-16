import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { GameData } from '@common/game-data';
import { Player } from '@common/player';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MAX_PLAYERS, MIN_PLAYERS } from './lobby.service.const';

@Injectable()
export class LobbyService {
    @Inject(forwardRef(() => LobbyGateway)) private readonly lobbyGateway: LobbyGateway;
    @Inject(MatchService) private readonly matchService: MatchService;
    @Inject(PlayService) private readonly playService: PlayService;

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
        this.lobbyGateway.disconnectPlayer(playerId);

        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const isMatchStarted = this.matchService.getIsMatchStarted(matchCode);

        if (matchCode) {
            if (isMatchStarted) {
                this.leaveStartedMatch(matchCode, playerId);
            } else {
                this.leaveNotStartedMatch(matchCode, playerId);
            }
        }
    }

    leaveStartedMatch(matchCode: string, playerId: string) {
        const match = this.matchService.getMatch(matchCode);
        const player = match.matchData.players.find((p) => p.id === playerId);
        if (player) {
            player.isConnected = false;
        }
        const connectedPlayers = match.matchData.players.filter((p) => p.isConnected);
        if (connectedPlayers.length <= 1) {
            this.lobbyGateway.disconnectPlayer(connectedPlayers[0].id);
            this.lobbyGateway.emitRemovedFromMatch(connectedPlayers[0].id);
            match.matchData.players.forEach((p) => {
                this.matchService.removePlayerFromMatch(p.id, matchCode);
            });
        } else {
            this.lobbyGateway.emitPlayerLeft(matchCode, match);
            this.playService.endTurn(playerId);
        }
    }

    leaveNotStartedMatch(playerId: string, matchCode: string) {
        const isAdmin = this.matchService.isPlayerAdmin(playerId);
        this.matchService.removePlayerFromMatch(playerId, matchCode);

        if (isAdmin) {
            this.kickAllPlayers(matchCode);
        } else {
            this.emitUpdatePlayerList(matchCode);
            this.emitLockStatusChanged(matchCode);
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
        if (updatedFields) {
            const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
            const players = this.matchService.getPlayers(matchCode);
            const player = players.find((p) => p.id === playerId);

            if (player) {
                Object.assign(player, updatedFields);
                if (updatedFields.name) {
                    player.name = this.matchService.getUniqueName(updatedFields.name, playerId);
                }
                if (updatedFields.isConnected) {
                    this.emitLockStatusChanged(matchCode);
                }
                this.emitUpdatePlayerList(matchCode);
            }
        }
    }

    startMatch(playerId: string) {
        const canStartMatch = this.canStartMatch(playerId);
        if (canStartMatch) {
            const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
            this.playService.startMatch(matchCode);
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
            this.lobbyGateway.emitRemovedFromMatch(player.id);
        });
    }

    private canPlayerJoinMatch(playerId: string, matchCode: string): boolean {
        let result = true;

        if (!this.matchService.hasMatchCode(matchCode)) {
            this.lobbyGateway.warn(playerId, "La partie n'existe pas");
            result = false;
        } else if (this.isMatchFull(matchCode)) {
            this.lobbyGateway.warn(playerId, 'La partie est pleine');
            result = false;
        } else if (this.isMatchLocked(matchCode)) {
            this.lobbyGateway.warn(playerId, 'La partie est verouillée');
            result = false;
        } else if (this.matchService.isPlayerInMatch(playerId)) {
            this.lobbyGateway.warn(playerId, 'Vous êtes déjà dans une partie');
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
                this.kickPlayer(player.id);
            }
        });
    }

    private emitUpdatePlayerList(matchCode: string): void {
        const players = this.matchService.getPlayers(matchCode);
        this.lobbyGateway.emitUpdatePlayerList(matchCode, players);
    }

    private canStartMatch(playerId: string): boolean {
        let canStartMatch = false;
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        if (matchCode) {
            const match = this.matchService.getMatch(matchCode);
            const currentPlayerCount = match.matchData.players.length;
            const isAdmin = this.matchService.isPlayerAdmin(playerId);
            const isMatchLocked = !this.canJoinMatch(matchCode);
            const hasEnoughPlayers = currentPlayerCount >= MIN_PLAYERS;
            const areAllPlayersConnected = match.matchData.players.every((p) => p.isConnected);
            canStartMatch = isAdmin && isMatchLocked && hasEnoughPlayers && areAllPlayersConnected;
        }
        return canStartMatch;
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
}
