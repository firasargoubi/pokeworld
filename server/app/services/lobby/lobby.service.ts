import { Inject, Injectable } from '@nestjs/common';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { CODE_LENGTH, CODE_RANGE, DEFAULT_MATCH_DATA, DEFAULT_PLAYER } from './lobby.service.const';
import { GameService } from '@app/services/game/game.service';
import { GameData } from '@common/game-data';

@Injectable()
export class LobbyService {
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
            this.matches.set(matchCode, match);

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

    removePlayerFromMatch(playerId: string, matchCode: string): void {
        this.matches.get(matchCode)?.matchData.players.filter((player) => player.id !== playerId);
        this.playerToMatchCode.delete(playerId);
    }

    isPlayerAdmin(playerId: string): boolean {
        const players = this.getPlayersFromPlayerId(playerId);
        const player = players.find((p) => p.id === playerId);
        return player?.isAdmin ?? false;
    }

    getMatchCodeFromPlayerId(playerId: string): string {
        return this.playerToMatchCode.get(playerId);
    }

    deleteMatch(matchCode: string): string[] {
        const players = this.getPlayers(matchCode);
        const playerIds = [];

        players.forEach((player) => {
            this.playerToMatchCode.delete(player.id);
            playerIds.push(player.id);
        });

        this.matches.delete(matchCode);
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

    getPlayers(matchCode: string): Player[] {
        const match = this.getMatch(matchCode);
        return match?.matchData.players ?? [];
    }

    getPlayer(playerId: string): Player {
        const players = this.getPlayersFromPlayerId(playerId);
        const player = players.find((p) => p.id === playerId);
        return player;
    }

    setMatchLockState(matchCode: string, isLocked: boolean) {
        this.getMatch(matchCode).matchData.isLocked = isLocked;
    }

    getMatch(matchCode: string): Match {
        return this.matches.get(matchCode);
    }

    private addPlayerToMatch(player: Player, matchCode: string): void {
        this.matches.get(matchCode).matchData.players.push(player);
        this.playerToMatchCode.set(player.id, matchCode);
    }

    private getPlayersFromPlayerId(playerId: string): Player[] {
        const matchCode = this.getMatchCodeFromPlayerId(playerId);
        return this.getPlayers(matchCode);
    }

    private getMatchCode(): string {
        let matchCode: string;

        do {
            matchCode = Math.floor(Math.random() * CODE_RANGE)
                .toString()
                .padStart(CODE_LENGTH, '0');
        } while (this.matches.has(matchCode));

        return matchCode;
    }
}
