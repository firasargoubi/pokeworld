import { Test, TestingModule } from '@nestjs/testing';
import { SocialController } from './social.controller';
import { SocialService } from '@app/services/social/social.service';
import { SocialListTab } from '@common/interfaces/social';
import { FriendRequestDto } from '@app/model/dto/social/friend-request.dto';

describe('SocialController', () => {
    let controller: SocialController;
    let service: SocialService;

    const mockDto: FriendRequestDto = { userId: 'u1', targetUserId: 'u2' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SocialController],
            providers: [
                {
                    provide: SocialService,
                    useValue: {
                        sendFriendRequest: jest.fn(),
                        acceptFriendRequest: jest.fn(),
                        rejectFriendRequest: jest.fn(),
                        removeFriend: jest.fn(),
                        blockUser: jest.fn(),
                        unblockUser: jest.fn(),
                        getRelationshipList: jest.fn(),
                        getRelationships: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<SocialController>(SocialController);
        service = module.get<SocialService>(SocialService);
    });

    it('should call sendFriendRequest', async () => {
        await controller.sendFriendRequest(mockDto);
        expect(service.sendFriendRequest).toHaveBeenCalledWith(mockDto.userId, mockDto.targetUserId);
    });

    it('should call acceptFriendRequest', async () => {
        await controller.acceptFriendRequest(mockDto);
        expect(service.acceptFriendRequest).toHaveBeenCalledWith(mockDto.userId, mockDto.targetUserId);
    });

    it('should call rejectFriendRequest', async () => {
        await controller.rejectFriendRequest(mockDto);
        expect(service.rejectFriendRequest).toHaveBeenCalledWith(mockDto.userId, mockDto.targetUserId);
    });

    it('should call removeFriend', async () => {
        await controller.removeFriend(mockDto);
        expect(service.removeFriend).toHaveBeenCalledWith(mockDto.userId, mockDto.targetUserId);
    });

    it('should call blockUser', async () => {
        await controller.blockUser(mockDto);
        expect(service.blockUser).toHaveBeenCalledWith(mockDto.userId, mockDto.targetUserId);
    });

    it('should call unblockUser', async () => {
        await controller.unblockUser(mockDto);
        expect(service.unblockUser).toHaveBeenCalledWith(mockDto.userId, mockDto.targetUserId);
    });

    it('should call getRelationshipList with default values', async () => {
        await controller.getRelationshipList('u1');
        expect(service.getRelationshipList).toHaveBeenCalledWith('u1', SocialListTab.Search, '');
    });

    it('should call getRelationships', async () => {
        await controller.getRelationships('u1');
        expect(service.getRelationships).toHaveBeenCalledWith('u1');
    });
});
