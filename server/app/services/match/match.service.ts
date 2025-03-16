import { TurnData } from '@app/interfaces/turn-data';
import { GameData } from '@common/game-data';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';
import { CODE_LENGTH, CODE_RANGE, DEFAULT_MATCH_DATA, DEFAULT_PLAYER, DEFAULT_TURN_DATA } from './match.service.const';

@Injectable()
export class MatchService {
    private matches: Map<string, Match> = new Map();
    private turnDatas: Map<string, TurnData> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    createMatch(gameData: GameData): string {
        const matchCode = this.getNewMatchCode();
        const match: Match = { gameData, matchData: structuredClone(DEFAULT_MATCH_DATA) };
        match.matchData.code = matchCode;
        this.matches.set(matchCode, match);
        this.turnDatas.set(matchCode, DEFAULT_TURN_DATA);
        return matchCode;
    }

    isActivePlayer(playerId: string): boolean {
        let isActivePlayer = false;
        const matchCode = this.getMatchCodeFromPlayerId(playerId);
        if (matchCode) {
            const activePlayerId = this.getActivePlayerId(matchCode);
            if (playerId === activePlayerId) {
                isActivePlayer = true;
            }
        }
        return isActivePlayer;
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

    getActivePlayerId(matchCode: string): string {
        let activePlayerId = '';
        const match = this.getMatch(matchCode);
        if (match) {
            activePlayerId = match.matchData.players[match.matchData.activePlayer].id;
        }
        return activePlayerId;
    }

    getTurnData(matchCode: string): TurnData {
        return this.turnDatas.get(matchCode);
    }

    removePlayerFromMatch(playerId: string, matchCode: string): void {
        const match = this.getMatch(matchCode);
        if (match) {
            match.matchData.players = match.matchData.players.filter((p) => p.id !== playerId);
            if (match.matchData.players.length <= 0) {
                this.matches.delete(matchCode);
                const turnData = this.turnDatas.get(matchCode);
                if (turnData.phaseTimeout) {
                    clearTimeout(turnData.phaseTimeout);
                    turnData.phaseTimeout = null;
                }
                this.turnDatas.delete(matchCode);
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
