/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserService } from '@app/services/user/user.service';
import { RelationshipType, SocialListTab } from '@common/interfaces/social';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SocialService } from './social.service';

describe('SocialService', () => {
    let service: SocialService;
    let relModel: any;
    let userModel: any;
    let userService: UserService;

    const mockRel = {
        userId: 'u1',
        friends: ['f1'],
        blockedUsers: ['b1'],
        blockedByUsers: [],
        pendingRequestsSent: ['p1'],
        pendingRequestsReceived: ['r1'],
    };

    beforeEach(() => {
        relModel = {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            bulkWrite: jest.fn(),
        };
        userModel = {
            countDocuments: jest.fn(),
        };
        userService = { getAllUsers: jest.fn() } as unknown as UserService;
        service = new SocialService(relModel as any, userModel as any, userService as any);
    });

    it('sendFriendRequest should skip if users are already related', async () => {
        (service as any).preparePair = jest
            .fn()
            .mockResolvedValue([
                mockRel,
                { friends: [], blockedUsers: [], blockedByUsers: [], pendingRequestsSent: [], pendingRequestsReceived: [] },
            ]);
        await service.sendFriendRequest('u1', 'f1');
        expect((relModel as any).bulkWrite).not.toHaveBeenCalled();
    });

    it('sendFriendRequest should execute bulkWrite if no relation exists', async () => {
        (service as any).preparePair = jest.fn().mockResolvedValue([
            {
                friends: [],
                blockedUsers: [],
                pendingRequestsSent: [],
                pendingRequestsReceived: [],
            },
            { blockedUsers: [] },
        ]);

        await service.sendFriendRequest('u1', 'u2');
        expect((relModel as any).bulkWrite).toHaveBeenCalled();
    });

    it('blockUser should clean relations and add to blocked list', async () => {
        (service as any).preparePair = jest.fn().mockResolvedValue([
            { friends: [], blockedUsers: [], blockedByUsers: [], pendingRequestsSent: [], pendingRequestsReceived: [] },
            { friends: [], blockedUsers: [], blockedByUsers: [], pendingRequestsSent: [], pendingRequestsReceived: [] },
        ]);
        await service.blockUser('u1', 'u2');

        expect((relModel as any).bulkWrite).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    updateOne: expect.objectContaining({
                        filter: { userId: 'u1' },
                        update: expect.objectContaining({ $addToSet: { blockedUsers: 'u2' } }),
                    }),
                }),
            ]),
        );
    });

    it('getRelationshipList (Friends) should return only friends', async () => {
        (userModel as any).countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
        (relModel as any).findOne.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRel) }) });
        (userService.getAllUsers as jest.Mock).mockResolvedValue([{ userId: 'f1', username: 'FRIEND' }]);

        const result = await service.getRelationshipList('u1', SocialListTab.Friends, '');

        expect(result[0].relation).toBe(RelationshipType.Friend);
        expect(userService.getAllUsers).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: { $in: ['f1'] },
            }),
        );
    });

    it('getRelationshipList (Search) should exclude related users', async () => {
        (userModel as any).countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
        (relModel as any).findOne.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRel) }) });
        (userService.getAllUsers as jest.Mock).mockResolvedValue([]);

        await service.getRelationshipList('u1', SocialListTab.Search, '');

        expect(userService.getAllUsers).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: { $nin: expect.arrayContaining(['u1', 'f1', 'b1', 'r1']) },
            }),
        );
    });

    it('validateDistinctUsers should throw BadRequestException if IDs are identical', () => {
        expect(() => service['validateDistinctUsers']('u1', 'u1')).toThrow(BadRequestException);
    });

    it('ensureActiveUsersExist should throw NotFoundException if a user is missing', async () => {
        (userModel as any).countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
        await expect(service['ensureActiveUsersExist'](['u1', 'u2'])).rejects.toThrow(NotFoundException);
    });
});
