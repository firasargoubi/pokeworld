import { Inject, Injectable } from '@nestjs/common';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { GameData } from '@common/game-data';
import { GameService } from '@app/services/game/game.service';
import { CODE_LENGTH, CODE_RANGE, DEFAULT_MATCH_DATA, DEFAULT_PLAYER, MAX_PLAYERS } from './match.service.const';

@Injectable()
export class MatchService {
    @Inject(GameService) private readonly gameService: GameService;
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    async createMatch(gameId: string, playerId: string): Promise<string> {
        let matchCode = '';
        const gameData: GameData = await this.gameService.getGameData(gameId);

        if (gameData._id) {
            matchCode = this.getMatchCode();
            const match: Match = { gameData, matchData: structuredClone(DEFAULT_MATCH_DATA) };
            match.matchData.code = matchCode;
            this.setMatch(matchCode, match);

            const newPlayer = { ...DEFAULT_PLAYER, id: playerId, isAdmin: true };
            this.addPlayerToMatch(newPlayer, matchCode);
        }

        return matchCode;
    }

    joinMatch(matchCode: string, playerId: string): boolean {
        const match: Match | null = this.getMatch(matchCode) ?? null;
        const isMatchUnlocked = !(match?.matchData.isLocked ?? true);

        if (isMatchUnlocked) {
            const newPlayer = { ...DEFAULT_PLAYER, id: playerId };
            this.addPlayerToMatch(newPlayer, matchCode);
        }

        return isMatchUnlocked;
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

    getMatchCode(): string {
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
        this.matches.get(matchCode)?.matchData.players.filter((player) => player.id !== playerId);
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

    isRoomLocked(matchCode: string): boolean {
        const match = this.getMatch(matchCode);
        const maxPlayerCount = MAX_PLAYERS[match.gameData.mapData.size];
        const currentPlayerCount = match.matchData.players.length;
        const isRoomFull = currentPlayerCount >= maxPlayerCount;

        return match.matchData.isLocked || isRoomFull;
    }
}
