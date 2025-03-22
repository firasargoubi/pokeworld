import { TurnData } from '@app/interfaces/turn-data';
import { CODE_LENGTH, CODE_RANGE, DEFAULT_MATCH_DATA } from '@common/consts/match.const';
import { DEFAULT_PLAYER } from '@common/consts/player.const';
import { GameData } from '@common/interfaces/game-data';
import { Match } from '@common/interfaces/match';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';
import { DEFAULT_TURN_DATA } from './match.service.const';

@Injectable()
export class MatchService {
    private matches: Map<string, Match> = new Map();
    private turnDatas: Map<string, TurnData> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    getPlayerIndex(matchCode: string, playerId: string): number {
        const players = this.getPlayers(matchCode);
        return players.findIndex((p) => p.id === playerId);
    }

    createMatch(gameData: GameData): string {
        const matchCode = this.getNewMatchCode();
        const match: Match = { gameData, matchData: structuredClone(DEFAULT_MATCH_DATA) };
        match.matchData.code = matchCode;
        this.matches.set(matchCode, match);
        this.turnDatas.set(matchCode, DEFAULT_TURN_DATA);
        return matchCode;
    }

    isActivePlayer(matchCode: string, playerId: string): boolean {
        const activePlayerId = this.getActivePlayerId(matchCode);
        return playerId === activePlayerId;
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

    isPlayerAdmin(playerId: string, matchCode: string): boolean {
        let isAdmin = false;
        const players = this.getPlayers(matchCode);
        if (players) {
            const player = players.find((p) => p.id === playerId);
            if (player) {
                isAdmin = player.isAdmin;
            }
        }
        return isAdmin;
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

    removePlayerFromMatch(playerId: string, matchCode: string, changePlayerList: boolean): void {
        const match = this.getMatch(matchCode);
        if (match) {
            if (changePlayerList) {
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
        }
        this.playerToMatchCode.delete(playerId);
    }

    getMatchCode(playerId: string): string {
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

    getPlayer(matchCode: string, playerId: string): Player {
        const players = this.getPlayers(matchCode);
        const player = players.find((p) => p.id === playerId);
        return player;
    }
}
