import { PurchaseItemDto } from '@app/model/dto/balance/purchase-item.dto';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { BalanceService } from '@app/services/balance/balance.service';
import { DEFAULT_PREFERENCES } from '@common/interfaces/preferences';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BalanceController } from './balance.controller';

describe('BalanceController', () => {
    let controller: BalanceController;
    let balanceService: SinonStubbedInstance<BalanceService>;

    const fakeUserResponse: UserResponseDto = {
        userId: 'user123',
        username: 'testUser',
        isLoggedIn: true,
        email: 'user@test.com',
        profilePicture: '',
        fullProfilePicture: '',
        balance: 4000,
        inventory: [],
        challenges: [],
        preferences: DEFAULT_PREFERENCES,
        tutorialStep: 0,
    };

    beforeEach(async () => {
        balanceService = createStubInstance(BalanceService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BalanceController],
            providers: [{ provide: BalanceService, useValue: balanceService }],
        }).compile();

        controller = module.get<BalanceController>(BalanceController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('purchaseItem', () => {
        const userId = 'user123';
        const dto: PurchaseItemDto = { itemId: 'party-ball' };

        it('should purchase an item for a user', async () => {
            balanceService.purchaseItem.resolves(fakeUserResponse);

            const response = await controller.purchaseItem(userId, dto);

            expect(response).toBe(fakeUserResponse);
            expect(balanceService.purchaseItem.calledWith(userId, dto.itemId)).toBeTruthy();
        });

        it('should propagate NotFoundException when the user does not exist', async () => {
            balanceService.purchaseItem.rejects(new NotFoundException(`User ${userId} not found`));

            await expect(controller.purchaseItem(userId, dto)).rejects.toThrow(NotFoundException);
            await expect(controller.purchaseItem(userId, dto)).rejects.toThrow(`User ${userId} not found`);
        });

        it('should propagate BadRequestException when the user balance is insufficient', async () => {
            balanceService.purchaseItem.rejects(new BadRequestException('Insufficient balance'));

            await expect(controller.purchaseItem(userId, dto)).rejects.toThrow(BadRequestException);
            await expect(controller.purchaseItem(userId, dto)).rejects.toThrow('Insufficient balance');
        });
    });
});
