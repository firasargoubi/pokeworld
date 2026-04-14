import { User, UserDocument, userSchema } from '@app/model/schema/user.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { BalanceService } from './balance.service';

describe('BalanceService', () => {
    let service: BalanceService;
    let userModel: Model<UserDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
            ],
            providers: [BalanceService],
        }).compile();

        service = module.get<BalanceService>(BalanceService);
        userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop({ doCleanup: true });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(userModel).toBeDefined();
    });

    describe('purchaseItem', () => {
        it('should throw NotFoundException when the user does not exist', async () => {
            await expect(service.purchaseItem('missing-user', 'party-ball')).rejects.toThrow(NotFoundException);
            await expect(service.purchaseItem('missing-user', 'party-ball')).rejects.toThrow('purchase.error.userNotFound');
        });

        it('should throw BadRequestException when the balance is insufficient', async () => {
            const [shopItem] = service.getShopItems();
            await userModel.create({
                userId: 'user123',
                username: 'testUser',
                passwordHash: 'hashed-password',
                balance: shopItem.price - 1,
            });

            await expect(service.purchaseItem('user123', shopItem.id)).rejects.toThrow(BadRequestException);
            await expect(service.purchaseItem('user123', shopItem.id)).rejects.toThrow('purchase.error.insufficientBalance');
        });
    });
});
