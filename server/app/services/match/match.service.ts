import { Inject, Injectable } from '@nestjs/common';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { GameData } from '@common/game-data';
import { GameService } from '@app/services/game/game.service';
import { CODE_LENGTH, CODE_RANGE, DEFAULT_MATCH_DATA, DEFAULT_PLAYER, MAX_PLAYERS, MIN_PLAYERS } from './match.service.const';

@Injectable()
export class MatchService {
    @Inject(GameService) private readonly gameService: GameService;
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    async createMatch(gameId: string, playerId: string): Promise<string> {
        let matchCode = '';
        const gameData: GameData = await this.gameService.getGameData(gameId);

        if (gameData._id) {
            matchCode = this.getNewMatchCode();
            const match: Match = { gameData, matchData: structuredClone(DEFAULT_MATCH_DATA) };
            match.matchData.code = matchCode;
            this.setMatch(matchCode, match);

            const newPlayer = { ...DEFAULT_PLAYER, id: playerId, isAdmin: true };
            this.addPlayerToMatch(newPlayer, matchCode);
        }

        return matchCode;
    }

    startMatch(playerId: string) {
        let matchCode = '';

        const canStartMatch = this.canStartMatch(playerId);
        if (canStartMatch) {
            matchCode = this.getMatchCodeFromPlayerId(playerId);
            this.sanitizeMatch(matchCode);
        }

        return matchCode;
    }

    joinMatch(matchCode: string, playerId: string): boolean {
        const canJoin = !this.isMatchLocked(matchCode);

        if (canJoin) {
            const newPlayer = { ...DEFAULT_PLAYER, id: playerId };
            this.addPlayerToMatch(newPlayer, matchCode);
        }

        return canJoin;
    }

    isPlayerAdmin(playerId: string): boolean {
        const players = this.getPlayersFromPlayerId(playerId);
        const player = players.find((p) => p.id === playerId);
        return player?.isAdmin ?? false;
    }

    destroyMatch(matchCode: string): string[] {
        const players = this.getPlayers(matchCode);
        const playerIds = [];

        players.forEach((player) => {
            this.removePlayerFromMatch(matchCode, player.id);
            playerIds.push(player.id);
        });

        this.removeMatch(matchCode);
        return playerIds;
    }

    getUniqueName(name: string, playerId: string): string {
        const players = this.getPlayersFromPlayerId(playerId);
        let newName = name;
        let suffix = 2;

        while (players.some((p) => p.name === newName && p.id !== playerId)) {
            newName = `${name}-${suffix}`;
            suffix++;
        }

        return newName;
    }

    getNewMatchCode(): string {
        let matchCode: string;

        do {
            matchCode = Math.floor(Math.random() * CODE_RANGE)
                .toString()
                .padStart(CODE_LENGTH, '0');
        } while (this.hasMatchCode(matchCode));

        return matchCode;
    }

    getMatch(matchCode: string): Match {
        return this.matches.get(matchCode);
    }

    setMatch(matchCode: string, match: Match) {
        this.matches.set(matchCode, match);
    }

    removeMatch(matchCode: string) {
        this.matches.delete(matchCode);
    }

    removePlayerFromMatch(playerId: string, matchCode: string): void {
        const match = this.matches.get(matchCode);
        if (match) {
            match.matchData.players = match.matchData.players.filter((p) => p.id !== playerId);
        }
        this.playerToMatchCode.delete(playerId);
    }

    getMatchCodeFromPlayerId(playerId: string): string {
        return this.playerToMatchCode.get(playerId);
    }

    setMatchLockState(matchCode: string, isLocked: boolean) {
        this.getMatch(matchCode).matchData.isLocked = isLocked;
    }

    addPlayerToMatch(player: Player, matchCode: string): void {
        this.matches.get(matchCode).matchData.players.push(player);
        this.playerToMatchCode.set(player.id, matchCode);
    }

    hasMatchCode(matchCode: string): boolean {
        return this.matches.has(matchCode);
    }

    getPlayers(matchCode: string): Player[] {
        const match = this.getMatch(matchCode);
        return match?.matchData.players ?? [];
    }

    getPlayer(playerId: string): Player {
        const players = this.getPlayersFromPlayerId(playerId);
        const player = players.find((p) => p.id === playerId);
        return player;
    }

    getPlayersFromPlayerId(playerId: string): Player[] {
        const matchCode = this.getMatchCodeFromPlayerId(playerId);
        return this.getPlayers(matchCode);
    }

    isMatchLocked(matchCode: string): boolean {
        let isMatchLocked = true;

        const match = this.getMatch(matchCode);
        if (match) {
            const maxPlayerCount = MAX_PLAYERS[match.gameData.mapData.size];
            const currentPlayerCount = match.matchData.players.length;
            const isMatchFull = currentPlayerCount >= maxPlayerCount;
            isMatchLocked = match.matchData.isLocked || isMatchFull;
        }

        return isMatchLocked;
    }

    private canStartMatch(playerId: string): boolean {
        const matchCode = this.getMatchCodeFromPlayerId(playerId);
        const match = this.getMatch(matchCode);
        const currentPlayerCount = match.matchData.players.length;

        const isAdmin = this.isPlayerAdmin(playerId);
        const isMatchLocked = this.isMatchLocked(matchCode);
        const hasEnoughPlayers = currentPlayerCount >= MIN_PLAYERS;
        const areAllPlayersConnected = match.matchData.players.every((p) => p.isConnected);

        return isAdmin && isMatchLocked && hasEnoughPlayers && areAllPlayersConnected;
    }

    private sanitizeMatch(matchCode: string) {
        // TODO mettre les joueurs dans le bon ordre
        // eslint-disable-next-line no-console
        console.log('MatchService.sanitizeMatch()', matchCode);
    }
}
