import { Injectable } from '@nestjs/common';
import { Match } from '@common/match';
import { Player } from '@common/player';

@Injectable()
export class MatchService {
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

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
}
