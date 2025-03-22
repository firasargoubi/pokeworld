import { Match } from '@app/classes/match/match';
import { TurnData } from '@app/interfaces/turn-data';
import { DEFAULT_PLAYER } from '@common/consts/player.const';
import { GameData } from '@common/interfaces/game-data';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
    private matches: Map<string, Match> = new Map();
    private turnDatas: Map<string, TurnData> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    createMatch(gameData: GameData): string {
        const matchCode = this.getNewMatchCode();
        const match: Match = new Match(matchCode, gameData);
        this.matches.set(matchCode, match);
        return matchCode;
    }

    getMatch(matchCode: string): Match {
        return this.matches.get(matchCode);
    }

    getMatchCode(playerId: string): string {
        return this.playerToMatchCode.get(playerId);
    }

    getMatchFromPlayerId(playerId: string): Match {
        let match: Match;
        const matchCode = this.getMatchCode(playerId);
        if (matchCode) {
            match = this.getMatch(matchCode);
        }
        return match;
    }

    leaveMatch(matchCode: string, playerId: string): void {
        const match = this.getMatch(matchCode);
        if (match) {
            const hasNoPlayerLeft = match.leave(playerId);
            if (hasNoPlayerLeft) {
                this.turnDatas.delete(matchCode);
            }
        }
        this.playerToMatchCode.delete(playerId);
    }

    getUniqueName(name: string, playerId: string, matchCode: string): string {
        const players = this.getPlayers(matchCode);
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

    setMatchLockState(matchCode: string, isLocked: boolean) {
        this.getMatch(matchCode).matchData.isLocked = isLocked;
    }

    addPlayerToMatch(playerId: string, matchCode: string, isAdmin: boolean): void {
        const newPlayer = { ...structuredClone(DEFAULT_PLAYER), id: playerId, isAdmin };
        this.getMatch(matchCode).matchData.players.push(newPlayer);
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

    getPlayer(matchCode: string, playerId: string): Player {
        const players = this.getPlayers(matchCode);
        const player = players.find((p) => p.id === playerId);
        return player;
    }
}
