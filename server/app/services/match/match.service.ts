import { Match } from '@app/classes/match/match';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { CombatService } from '@app/services/combat/combat.service';
import { PlayService } from '@app/services/play/play.service';
import { REGULAR_ITEMS } from '@common/consts/map-data.const';
import { DEFAULT_MATCH_DATA, MATCH_CODE_LENGTH, MATCH_CODE_RANGE } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER_DATA } from '@common/consts/player-data.const';
import { GameData } from '@common/interfaces/game-data';
import { ItemType } from '@common/interfaces/item-type.enum';
import { MatchData } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
    @Inject(forwardRef(() => MatchGateway)) private matchGateway: MatchGateway;
    @Inject(forwardRef(() => CombatService)) private combatService: CombatService;
    @Inject(forwardRef(() => PlayService)) private readonly playService: PlayService;

    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    createMatch(playerId: string, gameData: GameData): MatchData | null {
        let matchData = null;
        if (this.canCreateMatch(playerId)) {
            matchData = {
                ...structuredClone(DEFAULT_MATCH_DATA),
                code: this.getNewMatchCode(),
                gameData,
                players: [{ ...structuredClone(DEFAULT_PLAYER_DATA), id: playerId }],
            };
            const match = new Match(matchData, this);
            this.matches.set(matchData.code, match);
            this.playerToMatchCode.set(playerId, matchData.code);
            this.matchGateway.connectPlayer(playerId, matchData.code);

            this.setupRandomItems(matchData);

            return matchData;
        }
        return matchData;
    }

    sendUpdate(matchData: MatchData) {
        this.matchGateway.emitUpdate(matchData.code, matchData);
    }

    sendMessage(matchCode: string, message: string) {
        this.matchGateway.emitMessage(matchCode, message);
    }

    playerRemovedFromMatch(playerId: string, reason: string) {
        this.matchGateway.emitRemovedFromMatch(playerId, reason);
        this.disconnectPlayer(playerId);
    }

    joinMatch(playerId: string, matchCode: string): MatchData | null {
        let matchData = null;
        if (this.canJoinMatch(playerId, matchCode)) {
            const match = this.getMatch(matchCode);
            match.join(playerId);
            this.playerToMatchCode.set(playerId, matchCode);
            this.matchGateway.connectPlayer(playerId, matchCode);
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
        const match = this.getMatchFromPlayerId(playerId);

        const player = match.getPlayer(playerId);
        player.items.forEach((item) => {
            this.playService.dropItem(match, player.id, item);
        });

        this.disconnectPlayer(playerId);
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

    killPlayerCombat(match: Match) {
        this.combatService.startCombatEndDeath(match);
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
        let canCreateMatch = true;
        if (this.hasPlayerId(playerId)) {
            this.matchGateway.emitMessage(playerId, Message.AlreadyInMatch);
            canCreateMatch = false;
        }
        return canCreateMatch;
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
            matchCode = Math.floor(Math.random() * MATCH_CODE_RANGE)
                .toString()
                .padStart(MATCH_CODE_LENGTH, '0');
        } while (this.hasMatchCode(matchCode));
        return matchCode;
    }

    private setupRandomItems(matchData: MatchData): void {
        const items = matchData.gameData.mapData.items;
        const unusedItems = REGULAR_ITEMS.filter((itemType) => {
            return !items[itemType] || items[itemType].length === 0;
        });

        const randomThreshold = 0.5;
        unusedItems.sort(() => Math.random() - randomThreshold);

        for (let i = 0; i < items[ItemType.Random].length; i++) {
            const itemType = unusedItems[i];
            items[itemType].push(items[ItemType.Random][i]);
        }
        items[ItemType.Random] = [];
    }
}
