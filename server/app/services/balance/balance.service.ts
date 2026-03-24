import { Match } from '@app/classes/match/match';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { User, UserDocument } from '@app/model/schema/user.schema';
import { MATCH_BALANCE_REWARDS, SHOP_ITEMS } from '@common/consts/shop.const';
import { GameMode } from '@common/interfaces/map-data';
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
            user.balance = (user.balance || 0) + reward;
            await user.save();

            trackingPlayer.balanceGain = reward;
            trackingPlayer.currentBalance = user.balance;
        }
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
            isLoggedIn: user.isLoggedIn,
            preferences,
        };
    }
}
