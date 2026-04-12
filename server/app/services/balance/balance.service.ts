import { Match } from '@app/classes/match/match';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { User, UserDocument } from '@app/model/schema/user.schema';
import { ENTRY_FEE_WINNER_DIVISOR } from '@common/consts/match-data.const';
import { MATCH_BALANCE_REWARDS, SHOP_ITEMS } from '@common/consts/shop.const';
import { GameMode } from '@common/interfaces/map-data';
import { PlayerData, PlayerType } from '@common/interfaces/player-data';
import { AppLanguage, AppTheme, DEFAULT_PREFERENCES, UserPreferences } from '@common/interfaces/preferences';
import { InventoryItem, ShopItem } from '@common/interfaces/shop';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BalanceService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    getShopItems(): ShopItem[] {
        return structuredClone(SHOP_ITEMS);
    }

    async purchaseItem(userId: string, itemId: string): Promise<UserResponseDto> {
        const shopItem = this.getShopItemById(itemId);
        const user = await this.userModel.findOne({ userId, deleted: false }).exec();

        if (!user) {
            throw new NotFoundException('purchase.error.userNotFound');
        }

        if ((user.balance || 0) < shopItem.price) {
            throw new BadRequestException('purchase.error.insufficientBalance');
        }

        const inventoryItem: InventoryItem = {
            itemId: shopItem.id,
            price: shopItem.price,
        };

        user.balance = (user.balance || 0) - shopItem.price;
        user.inventory = [...(user.inventory || []), inventoryItem];

        await user.save();
        return this.toUserResponse(user);
    }

    async applyMatchRewards(match: Match): Promise<void> {
        const entryFeeRewards = this.distributeEntryFees(match);
        for (const trackingPlayer of match.data.trackingData.players) {
            trackingPlayer.balanceGain = 0;
            const matchUser = match.data.players.find((player) => player.id === trackingPlayer.id);
            if (!matchUser.isConnected) {
                continue;
            }
            const user = await this.userModel.findOne({ userId: trackingPlayer.id, deleted: false }).exec();
            if (!user) {
                trackingPlayer.currentBalance = 0;
                continue;
            }

            const reward = this.getRewardForPlayer(match, trackingPlayer.id, trackingPlayer.team);
            const entryFeeReward = entryFeeRewards.get(trackingPlayer.id) ?? 0;
            const challengeReward = trackingPlayer.challenge?.isCompleted ? trackingPlayer.challenge.cashGain ?? 0 : 0;
            const totalReward = reward + entryFeeReward + challengeReward;

            user.balance = (user.balance || 0) + totalReward;
            await user.save();

            trackingPlayer.balanceGain = totalReward;
            trackingPlayer.currentBalance = user.balance;
        }
    }

    private distributeEntryFees(match: Match): Map<string, number> {
        const rewards = new Map<string, number>();
        const entryFee = match.data.lobbyData.entryFee;
        const paidCount = match.getPaidEntryFeeCount();
        if (entryFee <= 0 || paidCount === 0) return rewards;

        const totalPot = entryFee * paidCount;
        const winnerId = match.data.trackingData.matchWinner?.id;
        if (!winnerId) return rewards;

        const winnerPlayers = this.getWinnerPlayers(match, winnerId);
        if (winnerPlayers.length === 0) return rewards;

        const winnerPool = Math.round((totalPot * (ENTRY_FEE_WINNER_DIVISOR - 1)) / ENTRY_FEE_WINNER_DIVISOR);
        const eachWinnerReward = Math.round(winnerPool / winnerPlayers.length);
        const consolationPool = totalPot - winnerPool;

        const winnerIds = new Set(winnerPlayers.map((p) => p.userId ?? p.id));
        const loserPlayers = match.data.players.filter((p) => p.isConnected && p.type === PlayerType.Player && !winnerIds.has(p.userId ?? p.id));
        const eachLoserReward = loserPlayers.length > 0 ? Math.floor(consolationPool / loserPlayers.length) : 0;

        for (const winner of winnerPlayers) {
            if (!winner.userId) continue;
            rewards.set(winner.userId, eachWinnerReward);
        }

        if (eachLoserReward > 0) {
            for (const loser of loserPlayers) {
                if (!loser.userId) continue;
                rewards.set(loser.userId, eachLoserReward);
            }
        }

        return rewards;
    }

    private getWinnerPlayers(match: Match, winnerId: string): PlayerData[] {
        if (match.data.gameData.mapData.gameMode === GameMode.CTF) {
            const flagHolder = match.data.players.find((p) => p.id === winnerId);
            return flagHolder ? match.data.players.filter((p) => p.team === flagHolder.team && p.type === PlayerType.Player) : [];
        }
        return match.data.players.filter((p) => p.id === winnerId && p.type === PlayerType.Player);
    }

    private getShopItemById(itemId: string): ShopItem {
        const shopItem = SHOP_ITEMS.find((item) => item.id === itemId);
        if (!shopItem) {
            throw new BadRequestException(`Unknown shop item: ${itemId}`);
        }
        return shopItem;
    }

    private getRewardForPlayer(match: Match, trackingPlayerId: string, trackingPlayerTeam?: string): number {
        const winner = match.data.trackingData.matchWinner;

        if (!winner.id) {
            return MATCH_BALANCE_REWARDS.draw;
        }

        if (match.data.gameData.mapData.gameMode === GameMode.CTF) {
            return winner.name === trackingPlayerTeam ? MATCH_BALANCE_REWARDS.win : MATCH_BALANCE_REWARDS.loss;
        }

        return winner.id === trackingPlayerId ? MATCH_BALANCE_REWARDS.win : MATCH_BALANCE_REWARDS.loss;
    }

    private toUserResponse(user: UserDocument): UserResponseDto {
        const preferences: UserPreferences = user.preferences
            ? { theme: user.preferences.theme as AppTheme, language: user.preferences.language as AppLanguage }
            : { ...DEFAULT_PREFERENCES };

        return {
            userId: user.userId,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            fullProfilePicture: user.fullProfilePicture || user.profilePicture,
            balance: user.balance || 0,
            inventory: user.inventory || [],
            challenges: user.challenges || [],
            isLoggedIn: user.isLoggedIn,
            preferences,
            tutorialStep: user.tutorialStep || 0,
        };
    }
}
