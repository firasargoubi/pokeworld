import { UserRelationships, UserRelationshipsDocument } from '@app/model/schema/user-relationships.schema';
import { User, UserDocument } from '@app/model/schema/user.schema';
import { UserService } from '@app/services/user/user.service';
import { RelationshipType, SocialListItem, SocialListTab } from '@common/interfaces/social';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SocialService {
    constructor(
        @InjectModel(UserRelationships.name) private readonly userRelationshipsModel: Model<UserRelationshipsDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly userService: UserService,
    ) {}

    async areFriends(userId1: string, userId2: string): Promise<boolean> {
        const rel = await this.getRelationshipsLean(userId1);
        return rel.friends.includes(userId2);
    }

    async sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
        const [fromRel, toRel] = await this.preparePair(fromUserId, toUserId);
        const isBlocked = fromRel.blockedUsers.includes(toUserId) || toRel.blockedUsers.includes(fromUserId);
        const isFriend = fromRel.friends.includes(toUserId);
        const isPending = fromRel.pendingRequestsSent.includes(toUserId) || fromRel.pendingRequestsReceived.includes(toUserId);
        if (isBlocked || isFriend || isPending) return;
        await this.updatePairRelations(fromUserId, { $addToSet: { pendingRequestsSent: toUserId } }, toUserId, {
            $addToSet: { pendingRequestsReceived: fromUserId },
        });
    }

    async acceptFriendRequest(currentUserId: string, otherUserId: string): Promise<void> {
        await this.preparePair(currentUserId, otherUserId);
        await this.updatePairRelations(
            currentUserId,
            { $pull: { pendingRequestsReceived: otherUserId }, $addToSet: { friends: otherUserId } },
            otherUserId,
            { $pull: { pendingRequestsSent: currentUserId }, $addToSet: { friends: currentUserId } },
        );
    }

    async rejectFriendRequest(currentUserId: string, otherUserId: string): Promise<void> {
        await this.preparePair(currentUserId, otherUserId);
        await this.updatePairRelations(currentUserId, { $pull: { pendingRequestsReceived: otherUserId } }, otherUserId, {
            $pull: { pendingRequestsSent: currentUserId },
        });
    }

    async removeFriend(userId: string, friendUserId: string): Promise<void> {
        await this.preparePair(userId, friendUserId);
        await this.updatePairRelations(userId, { $pull: { friends: friendUserId } }, friendUserId, { $pull: { friends: userId } });
    }

    async blockUser(blockerId: string, blockedId: string): Promise<void> {
        await this.preparePair(blockerId, blockedId);
        await this.updatePairRelations(
            blockerId,
            {
                $addToSet: { blockedUsers: blockedId },
                $pull: {
                    friends: blockedId,
                    pendingRequestsSent: blockedId,
                    pendingRequestsReceived: blockedId,
                },
            },
            blockedId,
            {
                $addToSet: { blockedByUsers: blockerId },
                $pull: {
                    friends: blockerId,
                    pendingRequestsSent: blockerId,
                    pendingRequestsReceived: blockerId,
                },
            },
        );
    }

    async unblockUser(unblockerId: string, unblockedId: string): Promise<void> {
        await this.preparePair(unblockerId, unblockedId);
        await this.updatePairRelations(unblockerId, { $pull: { blockedUsers: unblockedId } }, unblockedId, {
            $pull: { blockedByUsers: unblockerId },
        });
    }

    async getRelationshipList(userId: string, tab: SocialListTab, query: string): Promise<SocialListItem[]> {
        await this.ensureActiveUsersExist([userId]);
        const rel = await this.getRelationshipsLean(userId);

        const usernameFilter = query.trim() ? { $regex: query.trim().toUpperCase(), $options: 'i' } : { $exists: true };
        const filters: Record<string, unknown> = { deleted: false, username: usernameFilter };

        let forcedRelation: RelationshipType;

        switch (tab) {
            case SocialListTab.Friends: {
                if (rel.friends.length === 0) return [];
                filters.userId = { $in: rel.friends };
                forcedRelation = RelationshipType.Friend;
                break;
            }
            case SocialListTab.Blocked: {
                if (rel.blockedUsers.length === 0) return [];
                filters.userId = { $in: rel.blockedUsers };
                forcedRelation = RelationshipType.Blocked;
                break;
            }
            case SocialListTab.ReceivedRequests: {
                if (rel.pendingRequestsReceived.length === 0) return [];
                filters.userId = { $in: rel.pendingRequestsReceived };
                forcedRelation = RelationshipType.PendingReceived;
                break;
            }
            default: {
                const excludedIds = [userId, ...rel.friends, ...rel.blockedUsers, ...rel.blockedByUsers, ...rel.pendingRequestsReceived];
                filters.userId = { $nin: excludedIds };
                break;
            }
        }

        const users = await this.userService.getAllUsers(filters);

        return users.map((user) => ({
            user: {
                userId: user.userId,
                username: user.username,
                profilePicture: user.profilePicture,
                fullProfilePicture: user.fullProfilePicture,
            },
            relation: forcedRelation ?? this.resolveSearchRelation(user.userId, rel),
        }));
    }

    async getRelationships(userId: string): Promise<UserRelationships> {
        await this.ensureActiveUsersExist([userId]);
        return this.getRelationshipsLean(userId);
    }

    async getBlockedUsers(userId: string): Promise<string[]> {
        const relationship = await this.getRelationshipsLean(userId);
        return relationship.blockedUsers;
    }

    async isBlockedBy(targetUserId: string, blockerUserId: string): Promise<boolean> {
        const blockerRelationships = await this.getRelationshipsLean(blockerUserId);
        return blockerRelationships.blockedUsers.includes(targetUserId);
    }

    private async updatePairRelations(
        userId1: string,
        update1: Record<string, unknown>,
        userId2: string,
        update2: Record<string, unknown>,
    ): Promise<void> {
        await this.userRelationshipsModel.bulkWrite([
            { updateOne: { filter: { userId: userId1 }, update: update1 } },
            { updateOne: { filter: { userId: userId2 }, update: update2 } },
        ]);
    }

    private async getRelationshipsLean(userId: string): Promise<UserRelationships> {
        const doc = await this.userRelationshipsModel.findOne({ userId }).lean().exec();
        return (
            doc || {
                userId,
                friends: [],
                pendingRequestsSent: [],
                pendingRequestsReceived: [],
                blockedUsers: [],
                blockedByUsers: [],
            }
        );
    }

    private async ensureActiveUsersExist(userIds: string[]): Promise<void> {
        const existingUsersCount = await this.userModel.countDocuments({ userId: { $in: userIds }, deleted: false }).exec();
        if (existingUsersCount !== userIds.length) {
            throw new NotFoundException('User not found');
        }
    }

    private async preparePair(firstUserId: string, secondUserId: string): Promise<[UserRelationshipsDocument, UserRelationshipsDocument]> {
        this.validateDistinctUsers(firstUserId, secondUserId);
        await this.ensureActiveUsersExist([firstUserId, secondUserId]);
        const pairDocumetns = await Promise.all([this.ensureRelationshipsDocument(firstUserId), this.ensureRelationshipsDocument(secondUserId)]);
        return pairDocumetns;
    }

    private validateDistinctUsers(firstUserId: string, secondUserId: string): void {
        if (!firstUserId || !secondUserId) {
            throw new BadRequestException('User ids are required');
        }
        if (firstUserId === secondUserId) {
            throw new BadRequestException('Operation requires two distinct users');
        }
    }

    private async ensureRelationshipsDocument(userId: string): Promise<UserRelationshipsDocument> {
        const doc = await this.userRelationshipsModel
            .findOneAndUpdate(
                { userId },
                {
                    $setOnInsert: {
                        userId,
                        friends: [],
                        pendingRequestsSent: [],
                        pendingRequestsReceived: [],
                        blockedUsers: [],
                        blockedByUsers: [],
                    },
                },
                { upsert: true, new: true },
            )
            .exec();

        return doc;
    }

    private resolveSearchRelation(targetId: string, rel: UserRelationships): RelationshipType {
        if (rel.pendingRequestsSent.includes(targetId)) return RelationshipType.PendingSent;
        if (rel.pendingRequestsReceived.includes(targetId)) return RelationshipType.PendingReceived;
        return RelationshipType.None;
    }
}
