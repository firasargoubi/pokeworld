import { Inject, Injectable } from '@nestjs/common';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { CODE_LENGTH, CODE_RANGE, DEFAULT_MATCH_DATA, DEFAULT_PLAYER } from './lobby.service.const';
import { GameService } from '@app/services/game/game.service';
import { GameData } from '@common/game-data';
import { MatchService } from '@app/services/match/match.service';

@Injectable()
export class LobbyService {
    @Inject(GameService) private readonly gameService: GameService;
    @Inject(MatchService) private readonly matchService: MatchService;

    async createMatch(gameId: string, playerId: string): Promise<string> {
        let matchCode = '';
        const gameData: GameData = await this.gameService.getGameData(gameId);

        if (gameData._id) {
            matchCode = this.getMatchCode();
            const match: Match = { gameData, matchData: structuredClone(DEFAULT_MATCH_DATA) };
            match.matchData.code = matchCode;
            this.matchService.setMatch(matchCode, match);

            const newPlayer = { ...DEFAULT_PLAYER, id: playerId, isAdmin: true };
            this.matchService.addPlayerToMatch(newPlayer, matchCode);
        }

        return matchCode;
    }

    joinMatch(matchCode: string, playerId: string): boolean {
        const match: Match | null = this.matchService.getMatch(matchCode) ?? null;
        const isMatchUnlocked = !(match?.matchData.isLocked ?? true);

        if (isMatchUnlocked) {
            const newPlayer = { ...DEFAULT_PLAYER, id: playerId };
            this.matchService.addPlayerToMatch(newPlayer, matchCode);
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
            this.matchService.removePlayerFromMatch(matchCode, player.id);
            playerIds.push(player.id);
        });

        this.matchService.removeMatch(matchCode);
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
        const match = this.matchService.getMatch(matchCode);
        return match?.matchData.players ?? [];
    }

    getPlayer(playerId: string): Player {
        const players = this.getPlayersFromPlayerId(playerId);
        const player = players.find((p) => p.id === playerId);
        return player;
    }

    private getPlayersFromPlayerId(playerId: string): Player[] {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        return this.getPlayers(matchCode);
    }

    private getMatchCode(): string {
        let matchCode: string;

        do {
            matchCode = Math.floor(Math.random() * CODE_RANGE)
                .toString()
                .padStart(CODE_LENGTH, '0');
        } while (this.matchService.hasMatchCode(matchCode));

        return matchCode;
    }
}
