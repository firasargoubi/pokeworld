import { Match } from '@app/classes/match/match';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { CODE_LENGTH, CODE_RANGE } from '@common/consts/match-data.const';
import { GameData } from '@common/interfaces/game-data';
import { MatchData } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
    @Inject(forwardRef(() => MatchGateway)) private matchGateway: MatchGateway;
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    createMatch(playerId: string, gameData: GameData): MatchData | null {
        let matchData: MatchData | null = null;
        if (this.canCreateMatch(playerId)) {
            const matchCode = this.getNewMatchCode();
            const match: Match = new Match(matchCode, gameData, playerId);
            this.matches.set(matchCode, match);
            this.playerToMatchCode.set(playerId, matchCode);
            matchData = match.data;
        }
        return matchData;
    }

    joinMatch(playerId: string, matchCode: string): MatchData | null {
        let matchData: MatchData | null = null;
        if (this.canJoinMatch(playerId, matchCode)) {
            const match = this.getMatch(matchCode);
            match.join(playerId);
            this.playerToMatchCode.set(playerId, matchCode);
            matchData = match.data;
        }
        return matchData;
    }

    getMatchFromPlayerId(playerId: string): Match {
        let match: Match;
        const matchCode = this.getMatchCode(playerId);
        if (matchCode) {
            match = this.getMatch(matchCode);
        }
        return match;
    }

    leaveMatch(playerId: string) {
        this.disconnectPlayer(playerId);
        const match = this.getMatchFromPlayerId(playerId);
        if (match) {
            match.leave(playerId);
            if (match.getConnectedPlayerCount() === 0) {
                match.clearTimeout();
                this.matches.delete(match.data.code);
            }
        }
    }

    disconnectPlayer(playerId: string) {
        this.playerToMatchCode.delete(playerId);
        this.matchGateway.disconnectPlayer(playerId);
    }

    private canJoinMatch(playerId: string, matchCode: string): boolean {
        let canJoinMatch = true;
        if (!this.hasMatchCode(matchCode)) {
            this.matchGateway.emitMessage(playerId, Message.InvalidMatchCode);
            canJoinMatch = false;
        } else if (this.hasPlayerId(playerId)) {
            this.matchGateway.emitMessage(playerId, Message.AlreadyInMatch);
            canJoinMatch = false;
        } else if (this.isMatchFull(matchCode)) {
            this.matchGateway.emitMessage(playerId, Message.RoomFull);
            canJoinMatch = false;
        } else if (this.isMatchLocked(matchCode)) {
            this.matchGateway.emitMessage(playerId, Message.RoomLocked);
            canJoinMatch = false;
        }
        return canJoinMatch;
    }

    private canCreateMatch(playerId: string): boolean {
        let canJoinMatch = true;
        if (this.hasPlayerId(playerId)) {
            this.matchGateway.emitMessage(playerId, Message.AlreadyInMatch);
            canJoinMatch = false;
        }
        // TODO vérifier si le match est toujours visible
        return canJoinMatch;
    }

    private isMatchFull(matchCode: string): boolean {
        let isMatchFull = false;
        const match = this.getMatch(matchCode);
        if (match) {
            isMatchFull = match.isFull();
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
