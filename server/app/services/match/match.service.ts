import { Match } from '@app/classes/match/match';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { Game } from '@app/model/schema/game.schema';
import { BotService } from '@app/services/bot/bot.service';
import { ChatService } from '@app/services/chat/chat.service';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game/game.service';
import { PlayService } from '@app/services/play/play.service';
import { DEFAULT_MATCH_DATA, MATCH_CODE_LENGTH, MATCH_CODE_RANGE } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER_DATA } from '@common/consts/player-data.const';
import { GameData } from '@common/interfaces/game-data';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { PlayerData } from '@common/interfaces/player-data';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
    @Inject(forwardRef(() => MatchGateway)) private matchGateway: MatchGateway;
    @Inject(forwardRef(() => CombatService)) private combatService: CombatService;
    @Inject(forwardRef(() => PlayService)) private playService: PlayService;
    @Inject(forwardRef(() => BotService)) private botService: BotService;
    @Inject(forwardRef(() => ChatService)) private chatService: ChatService;
    @Inject(GameService) private gameService: GameService;
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    async createMatch(playerId: string, gameData: GameData): Promise<MatchData | null> {
        let matchData = null;
        if (await this.canCreateMatch(playerId, gameData)) {
            matchData = {
                ...structuredClone(DEFAULT_MATCH_DATA),
                code: this.getNewMatchCode(),
                gameData,
                players: [{ ...structuredClone(DEFAULT_PLAYER_DATA), id: playerId }],
            };
            const match = new Match(matchData, this);
            this.matches.set(matchData.code, match);
            this.addPlayerToMatchCode(playerId, matchData.code);
            this.matchGateway.connectPlayer(playerId, matchData.code);
            this.matchGateway.broadcastMatchListUpdate();
        }
        return matchData;
    }

    sendUpdate(match: Match) {
        this.matchGateway.emitUpdate(match.data.code, match.data);
        this.botService.onMatchUpdate(match);
        this.matchGateway.broadcastMatchListUpdate();
    }

    sendMessage(matchCode: string, message: string, messageParams?: Record<string, string | number | boolean>, toHost: boolean = false) {
        this.matchGateway.emitMessage(matchCode, message, toHost, messageParams);
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
            this.addPlayerToMatchCode(playerId, matchCode);
            this.matchGateway.connectPlayer(playerId, matchCode);
            matchData = match.data;
            this.matchGateway.broadcastMatchListUpdate();
        }
        return matchData;
    }

    addPlayerToMatchCode(playerId: string, matchCode: string) {
        this.playerToMatchCode.set(playerId, matchCode);
    }

    remapPlayerSocketId(oldPlayerId: string, newPlayerId: string, matchCode?: string) {
        if (oldPlayerId === newPlayerId) {
            return;
        }
        const resolvedMatchCode = matchCode ?? this.playerToMatchCode.get(oldPlayerId);
        if (resolvedMatchCode) {
            this.playerToMatchCode.delete(oldPlayerId);
            this.playerToMatchCode.set(newPlayerId, resolvedMatchCode);
        }
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
        this.disconnectPlayer(playerId);
        if (match) {
            if (match.isHost(playerId) && match.data.playData.isDebugMode) {
                this.playService.changeDebugMode(match, playerId, false);
            }
            this.chatService.logPlayerLeft(match, playerId);
            match.leave(playerId);
            if (match.getConnectedPlayerCount() === 0) {
                match.data.players.forEach((player) => {
                    match.kickPlayer(player.id, Message.LastPlayerRemaining);
                });
                match.clearTimeout();
                match.clearBotTimeout();
                this.matches.delete(match.data.code);
            }
        }
        this.matchGateway.broadcastMatchListUpdate();
    }

    killPlayerCombat(match: Match) {
        this.combatService.startCombatEndDeath(match);
    }

    respawnPlayer(match: Match, player: PlayerData) {
        this.combatService.respawnPlayer(match, player);
    }

    startNextTurn(match: Match) {
        this.playService.startNextTurn(match);
    }

    updateUsernameInMatches(userId: string, newUsername: string) {
        this.matches.forEach((match) => {
            let hasChanges = false;

            match.data.players.forEach((player, playerIndex) => {
                if (player.userId === userId && player.name !== newUsername) {
                    player.name = newUsername;
                    hasChanges = true;

                    const trackingPlayer = match.data.trackingData.players.find((tracking) => tracking.id === (player.userId ?? player.id));
                    if (trackingPlayer) {
                        trackingPlayer.name = newUsername;
                    }

                    match.data.combatData.playersCombatData
                        .filter((combatPlayer) => combatPlayer.playerIndex === playerIndex)
                        .forEach((combatPlayer) => {
                            combatPlayer.name = newUsername;
                        });
                }
            });

            if (hasChanges) {
                this.sendUpdate(match);
            }
        });
    }

    getAvailableMatches(): MatchData[] {
        const matchesData: MatchData[] = [];
        this.matches.forEach((match) => {
            const isInLobby = match.data.state === MatchState.Lobby;
            const isMatchLocked = match.data.lobbyData.isLocked;
            const isMatchFull = match.isFull();

            const isAvailableLobby = isInLobby && !isMatchLocked;
            const isAvailableDropIn = !isInLobby && match.data.lobbyData.isDropInEnabled;

            const isMatchAvailable = !isMatchFull && (isAvailableLobby || isAvailableDropIn);
            if (isMatchAvailable) {
                matchesData.push(match.data);
            }
        });
        return matchesData;
    }

    private disconnectPlayer(playerId: string) {
        this.playerToMatchCode.delete(playerId);
        this.matchGateway.disconnectPlayer(playerId);
        this.matchGateway.broadcastMatchListUpdate();
    }

    private canJoinMatch(playerId: string, matchCode: string): boolean {
        let canJoinMatch = true;
        if (!this.hasMatchCode(matchCode)) {
            this.matchGateway.emitMessage(playerId, Message.InvalidMatchCode, true);
            canJoinMatch = false;
        } else if (this.hasPlayerId(playerId)) {
            this.matchGateway.emitMessage(playerId, Message.AlreadyInMatch, true);
            canJoinMatch = false;
        } else {
            const match = this.getMatch(matchCode);
            const isInLobby = match.isState([MatchState.Lobby]);
            const isDropIn = match.data.lobbyData.isDropInEnabled && !isInLobby;
            if (match.isFull()) {
                this.matchGateway.emitMessage(playerId, Message.RoomFull, true);
                canJoinMatch = false;
            } else if (!isInLobby && !isDropIn) {
                this.matchGateway.emitMessage(playerId, Message.DropInDisabled, true);
                canJoinMatch = false;
            } else if (!isDropIn && match.data.lobbyData.isLocked) {
                this.matchGateway.emitMessage(playerId, Message.RoomLocked, true);
                canJoinMatch = false;
            } else if (isDropIn && !match.hasAvailableSpawnPoint() && !this.hasDisconnectedObserver(match)) {
                this.matchGateway.emitMessage(playerId, Message.NoAvailableSpawn, true);
                canJoinMatch = false;
            }
        }
        return canJoinMatch;
    }

    private hasDisconnectedObserver(match: Match): boolean {
        return match.data.players.some((player) => !player.isConnected && !!player.isObserver);
    }

    private async canCreateMatch(playerId: string, gameData: GameData): Promise<boolean> {
        const game: Game = await this.gameService.findGame(gameData._id);
        let canCreateMatch = true;
        if (this.hasPlayerId(playerId)) {
            this.matchGateway.emitMessage(playerId, Message.AlreadyInMatch, true);
            canCreateMatch = false;
        } else if (!game) {
            this.matchGateway.emitMessage(playerId, Message.DeletedGame, true);
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
}
