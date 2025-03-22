import { Match } from '@app/classes/match/match';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { CODE_LENGTH, CODE_RANGE } from '@common/consts/match-data.const';
import { MAX_PLAYERS } from '@common/consts/player.const';
import { GameData } from '@common/interfaces/game-data';
import { Warning } from '@common/interfaces/warning.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
    @Inject(forwardRef(() => MatchGateway)) private matchGateway: MatchGateway;
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    createMatch(playerId: string, gameData: GameData): string {
        const matchCode = this.getNewMatchCode();
        const match: Match = new Match(matchCode, gameData, playerId);
        this.matches.set(matchCode, match);
        this.playerToMatchCode.set(playerId, matchCode);
        return matchCode;
    }

    joinMatch(playerId: string, matchCode: string): boolean {
        let hasJoined = false;
        if (this.canJoinMatch(playerId, matchCode)) {
            const match = this.getMatch(matchCode);
            match.join(playerId);
            this.playerToMatchCode.set(playerId, matchCode);
            hasJoined = true;
        }
        return hasJoined;
    }

    leaveMatch(playerId: string) {
        const match = this.getMatchFromPlayerId(playerId);
        if (match) {
            match.leave(playerId);
            const connectedPlayerCount = match.data.players.filter((p) => p.isConnected).length;
            if (connectedPlayerCount === 0) {
                this.matches.delete(match.data.code);
            }
        }
        this.playerToMatchCode.delete(playerId);
        this.matchGateway.disconnectPlayer(playerId);
    }

    getMatchFromPlayerId(playerId: string): Match {
        let match: Match;
        const matchCode = this.getMatchCode(playerId);
        if (matchCode) {
            match = this.getMatch(matchCode);
        }
        return match;
    }

    private canJoinMatch(playerId: string, matchCode: string) {
        let canJoinMatch = true;
        if (!this.hasMatchCode(matchCode)) {
            this.matchGateway.emitWarning(playerId, Warning.InvalidMatchCode);
            canJoinMatch = false;
        } else if (this.hasPlayerId(playerId)) {
            this.matchGateway.emitWarning(playerId, Warning.AlreadyInMatch);
            canJoinMatch = false;
        } else if (this.isMatchFull(matchCode)) {
            this.matchGateway.emitWarning(playerId, Warning.RoomFull);
            canJoinMatch = false;
        } else if (this.isMatchLocked(matchCode)) {
            this.matchGateway.emitWarning(playerId, Warning.RoomLocked);
            canJoinMatch = false;
        }
        return canJoinMatch;
    }

    private isMatchFull(matchCode: string): boolean {
        let isMatchFull = false;
        const match = this.getMatch(matchCode);
        if (match) {
            const maxPlayerCount = MAX_PLAYERS[match.data.gameData.mapData.size];
            const currentPlayerCount = match.data.players.filter((p) => p.isConnected).length;
            isMatchFull = currentPlayerCount >= maxPlayerCount;
        }
        return isMatchFull;
    }

    private isMatchLocked(matchCode: string): boolean {
        let isMatchLocked = false;
        const match = this.getMatch(matchCode);
        if (match) {
            isMatchLocked = match.data.lobbyData.isLocked;
        }
        return isMatchLocked;
    }

    private getMatch(matchCode: string): Match {
        return this.matches.get(matchCode);
    }

    private getMatchCode(playerId: string): string {
        return this.playerToMatchCode.get(playerId);
    }

    private hasMatchCode(matchCode: string): boolean {
        return this.matches.has(matchCode);
    }

    private hasPlayerId(playerId: string): boolean {
        return this.playerToMatchCode.has(playerId);
    }

    private getNewMatchCode(): string {
        let matchCode: string;
        do {
            matchCode = Math.floor(Math.random() * CODE_RANGE)
                .toString()
                .padStart(CODE_LENGTH, '0');
        } while (this.hasMatchCode(matchCode));
        return matchCode;
    }
}
