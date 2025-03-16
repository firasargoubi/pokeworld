import { GameData } from '@common/game-data';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';
import { CODE_LENGTH, CODE_RANGE, DEFAULT_MATCH_DATA, DEFAULT_PLAYER } from './match.service.const';

@Injectable()
export class MatchService {
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    createMatch(gameData: GameData): string {
        const matchCode = this.getNewMatchCode();
        const match: Match = { gameData, matchData: structuredClone(DEFAULT_MATCH_DATA) };
        match.matchData.code = matchCode;
        this.matches.set(matchCode, match);
        return matchCode;
    }

    isPlayerInMatch(playerId: string): boolean {
        return this.playerToMatchCode.has(playerId);
    }

    getIsMatchStarted(matchCode: string): boolean {
        let isStarted = false;
        const match = this.getMatch(matchCode);
        if (match) {
            isStarted = match.matchData.isStarted;
        }
        return isStarted;
    }

    isPlayerAdmin(playerId: string): boolean {
        let isAdmin = false;
        const players = this.getPlayersFromPlayerId(playerId);
        if (players) {
            const player = players.find((p) => p.id === playerId);
            if (player) {
                isAdmin = player.isAdmin;
            }
        }
        return isAdmin;
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

    removePlayerFromMatch(playerId: string, matchCode: string): void {
        const match = this.matches.get(matchCode);
        if (match) {
            match.matchData.players = match.matchData.players.filter((p) => p.id !== playerId);
            if (match.matchData.players.length <= 0) {
                this.matches.delete(matchCode);
            }
        }
        this.playerToMatchCode.delete(playerId);
    }

    getMatchCodeFromPlayerId(playerId: string): string {
        return this.playerToMatchCode.get(playerId);
    }

    setMatchLockState(matchCode: string, isLocked: boolean) {
        this.getMatch(matchCode).matchData.isLocked = isLocked;
    }

    addPlayerToMatch(playerId: string, matchCode: string, isAdmin: boolean): void {
        const newPlayer = structuredClone(DEFAULT_PLAYER);
        newPlayer.id = playerId;
        newPlayer.isAdmin = isAdmin;
        this.matches.get(matchCode).matchData.players.push(newPlayer);
        this.playerToMatchCode.set(playerId, matchCode);
    }

    hasMatchCode(matchCode: string): boolean {
        return this.matches.has(matchCode);
    }

    getPlayers(matchCode: string): Player[] {
        let players: Player[] = [];
        const match = this.getMatch(matchCode);
        if (match) {
            players = match.matchData.players;
        }
        return players;
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
}
