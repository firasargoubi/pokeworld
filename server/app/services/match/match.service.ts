import { Match } from '@app/classes/match/match';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { Game } from '@app/model/schema/game.schema';
import { UserRelationships } from '@app/model/schema/user-relationships.schema';
import { BotService } from '@app/services/bot/bot.service';
import { ChatService } from '@app/services/chat/chat.service';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game/game.service';
import { PlayService } from '@app/services/play/play.service';
import { SocialService } from '@app/services/social/social.service';
import { UserService } from '@app/services/user/user.service';
import { DEFAULT_MATCH_DATA, ENTRY_FEE_WINNER_DIVISOR, MATCH_CODE_LENGTH, MATCH_CODE_RANGE } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER_DATA } from '@common/consts/player-data.const';
import { MATCH_BALANCE_REWARDS } from '@common/consts/shop.const';
import { GameData } from '@common/interfaces/game-data';
import { MatchData, MatchSettings, MatchState } from '@common/interfaces/match-data';
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
    @Inject(forwardRef(() => SocialService)) private socialService: SocialService;
    @Inject(forwardRef(() => UserService)) private userService: UserService;
    @Inject(GameService) private gameService: GameService;
    private matches: Map<string, Match> = new Map();
    private playerToMatchCode: Map<string, string> = new Map();

    async createMatch(playerId: string, gameData: GameData, matchSettings?: MatchSettings): Promise<MatchData | null> {
        let matchData = null;
        if (await this.canCreateMatch(playerId, gameData, matchSettings?.entryFee || 0)) {
            const initialMatchData = {
                ...structuredClone(DEFAULT_MATCH_DATA),
                code: this.getNewMatchCode(),
                gameData,
                players: [{ ...structuredClone(DEFAULT_PLAYER_DATA), id: playerId, userId: playerId }],
            };
            const match = new Match(initialMatchData, this);
            if (matchSettings) {
                match.changeSettings(matchSettings);
            }
            matchData = match.data;
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

    async joinMatch(playerId: string, matchCode: string, confirmJoinBlockedUser: boolean = false): Promise<MatchData | null> {
        let matchData = null;
        if (await this.canJoinMatch(playerId, matchCode, confirmJoinBlockedUser)) {
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
        if (this.playerToMatchCode.has(playerId)) {
            this.removePlayerFromMatchCode(playerId);
        }
        this.playerToMatchCode.set(playerId, matchCode);
    }

    removePlayerFromMatchCode(playerId: string) {
        while (this.playerToMatchCode.has(playerId)) {
            this.playerToMatchCode.delete(playerId);
        }
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
        if (!match) {
            return;
        }
        if (match.isState([MatchState.Lobby])) {
            this.refundEntryFeeIfPaid(match, playerId);
            if (match.isHost(playerId)) {
                match.data.players.filter((p) => p.id !== playerId && p.isConnected).forEach(async (p) => this.refundEntryFeeIfPaid(match, p.id));
            }
        }
        this.disconnectPlayer(playerId);
        if (match.isHost(playerId) && match.data.playData.isDebugMode) {
            this.playService.changeDebugMode(match, playerId, false);
        }
        this.chatService.logPlayerLeft(match, playerId);
        match.leave(playerId);
        if (match.getConnectedPlayerCount() === 0) {
            match.clearTimeout();
            match.clearBotTimeout();
            this.matches.delete(match.data.code);
            this.chatService.deleteChannel(match.data.code);
        }
        this.matchGateway.broadcastMatchListUpdate();
    }

    async refundEntryFeeIfPaid(match: Match, playerId: string): Promise<void> {
        if (!match.isState([MatchState.Lobby])) return;
        const player = match.getPlayer(playerId);
        const entryFee = match.data.lobbyData.entryFee;
        if (player?.userId && entryFee > 0 && match.hasPaidEntryFee(player.userId)) {
            match.removePaidEntryFee(player.userId);
            await this.userService.updateBalance(player.userId, entryFee);
        }
    }

    async handleLastPlayerWin(match: Match, winner: PlayerData): Promise<void> {
        if (!winner.userId) return;

        await this.userService.updateBalance(winner.userId, MATCH_BALANCE_REWARDS.win);

        const entryFee = match.data.lobbyData.entryFee;
        const paidCount = match.getPaidEntryFeeCount();
        if (entryFee > 0 && paidCount > 0) {
            const totalPot = entryFee * paidCount;
            const winnerReward = Math.round((totalPot * (ENTRY_FEE_WINNER_DIVISOR - 1)) / ENTRY_FEE_WINNER_DIVISOR);
            if (winnerReward > 0) {
                await this.userService.updateBalance(winner.userId, winnerReward);
            }
        }
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

    async getAvailableMatches(viewerUserId: string): Promise<MatchData[]> {
        const matchesData: MatchData[] = [];
        const joiningUserRelationships = await this.socialService.getRelationships(viewerUserId);
        const userData = await this.userService.getUserById(viewerUserId);
        for (const match of this.matches.values()) {
            if (match.data.players.length === 0 || match.getConnectedPlayerCount() === 0) {
                continue;
            }
            if (match.data.lobbyData.entryFee > 0 && userData && userData.balance < match.data.lobbyData.entryFee) {
                continue;
            }

            const isInLobby = match.data.state === MatchState.Lobby;
            const isMatchLocked = match.data.lobbyData.isLocked;
            const isMatchFull = match.isFull();

            const isAvailableLobby = isInLobby && !isMatchLocked;
            const isAvailableDropIn = !isInLobby && match.data.lobbyData.isDropInEnabled;

            const isMatchAvailable = !isMatchFull && (isAvailableLobby || isAvailableDropIn);
            if (!isMatchAvailable) {
                continue;
            }

            if (!this.canJoinFriendOnlyMatch(joiningUserRelationships, match) && match.data.lobbyData.isFriendOnly) {
                continue;
            }

            if (this.isBlockedByPlayerInGame(joiningUserRelationships, match)) {
                continue;
            }

            matchesData.push(match.data);
        }

        return matchesData;
    }

    private disconnectPlayer(playerId: string) {
        this.matchGateway.disconnectPlayer(playerId);
        this.matchGateway.broadcastMatchListUpdate();
    }

    private async canJoinMatch(playerId: string, matchCode: string, confirmJoinBlockedUser = false): Promise<boolean> {
        if (!this.hasMatchCode(matchCode)) {
            this.matchGateway.emitMessage(playerId, Message.InvalidMatchCode, true);
            return false;
        }

        if (this.hasPlayerId(playerId)) {
            this.leaveMatch(playerId);
            this.matchGateway.emitMessage(playerId, Message.AlreadyInMatch, true);
            return false;
        }

        const match = this.getMatch(matchCode);

        const user = await this.userService.getUserById(playerId);
        if (!user) {
            this.matchGateway.emitMessage(playerId, Message.AccountNotFound, true);
            return false;
        }
        if (match.data.lobbyData.entryFee > 0 && user.balance < match.data.lobbyData.entryFee) {
            this.matchGateway.emitMessage(playerId, Message.InsufficientFunds, true);
            return false;
        }
        return await this.evaluateMatchJoinConditions(match, playerId, matchCode, confirmJoinBlockedUser);
    }

    private async evaluateMatchJoinConditions(match: Match, playerId: string, matchCode: string, confirmJoinBlockedUser: boolean): Promise<boolean> {
        const isInLobby = match.isState([MatchState.Lobby]);

        if (match.isFull()) {
            this.matchGateway.emitMessage(playerId, Message.RoomFull, true);
            return false;
        }

        const isDropIn = match.data.lobbyData.isDropInEnabled && !isInLobby;
        if (!isInLobby && !isDropIn) {
            this.matchGateway.emitMessage(playerId, Message.DropInDisabled, true);
            return false;
        }

        if (!isDropIn && match.data.lobbyData.isLocked) {
            this.matchGateway.emitMessage(playerId, Message.RoomLocked, true);
            return false;
        }

        const joiningUserRelationships = await this.socialService.getRelationships(playerId);

        const isBlockedByPlayerInGame = this.isBlockedByPlayerInGame(joiningUserRelationships, match);
        if (isBlockedByPlayerInGame) {
            this.matchGateway.emitMessage(playerId, Message.BlockedByPlayer, true);
            return false;
        }

        const canJoinFriendOnlyMatch = this.canJoinFriendOnlyMatch(joiningUserRelationships, match);
        if (!canJoinFriendOnlyMatch && match.data.lobbyData.isFriendOnly) {
            this.matchGateway.emitMessage(playerId, Message.NotFriend, true);
            return false;
        }

        const hasBlockedPlayerInGame = this.hasBlockedPlayerInGame(joiningUserRelationships, match);
        if (!confirmJoinBlockedUser && hasBlockedPlayerInGame) {
            this.matchGateway.emitMessage(playerId, Message.BlockedPlayerInLobby, true, { matchCode });
            return false;
        }

        if (isDropIn && !match.hasAvailableSpawnPoint() && !this.hasDisconnectedObserver(match)) {
            this.matchGateway.emitMessage(playerId, Message.NoAvailableSpawn, true);
            return false;
        }

        return true;
    }

    private canJoinFriendOnlyMatch(joiningUserRelationships: UserRelationships, match: Match): boolean {
        const hostPlayer = match.data.players[match.data.lobbyData.hostPlayerIndex];
        const hostUserId = hostPlayer?.userId;
        if (!hostUserId) {
            return false;
        }
        if (hostUserId === joiningUserRelationships.userId) {
            return true;
        }
        return joiningUserRelationships.friends.includes(hostUserId);
    }

    private isBlockedByPlayerInGame(joiningUserRelationships: UserRelationships, match: Match): boolean {
        return joiningUserRelationships.blockedByUsers.some((blockedByUserId) =>
            match.data.players.some((player) => player.userId === blockedByUserId),
        );
    }

    private hasBlockedPlayerInGame(joiningUserRelationships: UserRelationships, match: Match): boolean {
        return joiningUserRelationships.blockedUsers.some((blockedUserId) => match.data.players.some((player) => player.userId === blockedUserId));
    }

    private hasDisconnectedObserver(match: Match): boolean {
        return match.data.players.some((player) => !player.isConnected && !!player.isObserver);
    }

    private async canCreateMatch(playerId: string, gameData: GameData, entryFee: number = 0): Promise<boolean> {
        const game: Game = await this.gameService.findGame(gameData._id);
        let canCreateMatch = true;
        if (this.hasPlayerId(playerId)) {
            this.leaveMatch(playerId);
            this.matchGateway.emitMessage(playerId, Message.AlreadyInMatch, true);
            canCreateMatch = false;
        } else if (!game) {
            this.matchGateway.emitMessage(playerId, Message.DeletedGame, true);
            canCreateMatch = false;
        }
        const user = await this.userService.getUserById(playerId);
        if (!user) {
            this.matchGateway.emitMessage(playerId, Message.AccountNotFound, true);
            return false;
        }
        if (entryFee > 0 && user.balance < entryFee) {
            this.matchGateway.emitMessage(playerId, Message.InsufficientFunds, true);
            return false;
        }
        return canCreateMatch;
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
