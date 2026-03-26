import { Game, GameDocument, gameSchema } from '@app/model/schema/game.schema';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/interfaces/game-state.enum';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';

describe('GameService', () => {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (typeof jest !== 'undefined' && jest.setTimeout) jest.setTimeout(30000);
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    const fakeGame: Game = {
        name: 'Test Game',
        description: 'Test Description',
        owner: { userId: 'id', userName: 'user' },
        gameState: GameState.PRIVATE,
        lastEdited: new Date(),
        mapData: {
            tiles: [[]],
            items: {
                [ItemType.Item1]: [],
                [ItemType.Item2]: [],
                [ItemType.Item3]: [],
                [ItemType.Item4]: [],
                [ItemType.Item5]: [],
                [ItemType.Item6]: [],
                [ItemType.Random]: [],
                [ItemType.Spawn]: [],
                [ItemType.Flag]: [],
            },
            size: MapSize.Small,
            gameMode: GameMode.FFA,
        },
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [GameService],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        if (gameModel && typeof gameModel.deleteMany === 'function') {
            await gameModel.deleteMany({});
        }
    });

    afterAll(async () => {
        if (connection && typeof connection.close === 'function') {
            await connection.close();
        }
        if (mongoServer && typeof mongoServer.stop === 'function') {
            await mongoServer.stop({ doCleanup: true });
        }
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    it('getAllGames() should return all games in the database', async () => {
        await gameModel.create(fakeGame);
        expect((await service.getAllGames()).length).toBeGreaterThan(0);
    });

    it('getGame() should return a game by ID', async () => {
        const createdGame = await gameModel.create(fakeGame);
        const foundGame = await service.getGame(createdGame._id);
        expect(foundGame).toBeDefined();
        expect(foundGame._id.toString()).toEqual(createdGame._id.toString());
    });

    it('getGame() should throw BadRequestException for invalid ID format', async () => {
        await expect(service.getGame('invalid_id')).rejects.toThrow(BadRequestException);
    });

    it('getGame() should throw NotFoundException if game not found', async () => {
        const validObjectId = new gameModel()._id;
        await expect(service.getGame(validObjectId)).rejects.toThrow(NotFoundException);
    });

    it('should create a new game if _id is empty', async () => {
        const newGame = { ...fakeGame, _id: '' };
        const addSpy = jest.spyOn(service, 'addGame');
        const updateSpy = jest.spyOn(service, 'updateGame');
        const savedGame = await service.saveGame(newGame);
        expect(savedGame).toBeDefined();
        expect(addSpy).toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should update an existing game if _id is not empty and exists', async () => {
        const existingGame = await gameModel.create(fakeGame);
        const updatedGame = { ...existingGame.toObject(), name: 'Updated Game' };
        const updateSpy = jest.spyOn(service, 'updateGame');
        const savedGame = await service.saveGame(updatedGame);
        expect(savedGame).toBeDefined();
        expect(updateSpy).toHaveBeenCalled();
    });

    it('addGame() should create a new game', async () => {
        const createdGame = await service.addGame(fakeGame);
        expect(createdGame).toBeDefined();
        expect(createdGame.name).toEqual(fakeGame.name);
    });

    it('addGame() should throw BadRequestException if name already exists', async () => {
        await gameModel.create(fakeGame);
        await expect(service.addGame(fakeGame)).rejects.toThrow(BadRequestException);
    });

    it('addGame() should throw BadRequestException if the database create() fails', async () => {
        jest.spyOn(gameModel, 'create').mockRejectedValueOnce(new Error('Database error'));
        await expect(service.addGame(fakeGame)).rejects.toThrow(BadRequestException);
    });

    it('updateGame() should update an existing game', async () => {
        const createdGame = await gameModel.create(fakeGame);
        const updateData = { name: 'Updated Game' };
        const updatedGame = await service.updateGame(createdGame._id, updateData);
        expect(updatedGame).toBeDefined();
        expect(updatedGame.name).toEqual(updateData.name);
    });

    it('updateGame() should throw BadRequestException for invalid ID format', async () => {
        const updateData = { name: 'Updated Game' };
        await expect(service.updateGame('invalid_id', updateData)).rejects.toThrow(BadRequestException);
    });

    it('updateGame() should throw BadRequestException if the new name already exists', async () => {
        const game1 = fakeGame;
        const game2 = { ...fakeGame, name: 'Another Game' };
        await gameModel.create(game1);
        const createdGame2 = await gameModel.create(game2);

        await expect(service.updateGame(createdGame2._id, { name: game1.name })).rejects.toThrow(BadRequestException);
    });

    it('updateGame() should throw NotFoundException if findByIdAndUpdate returns null', async () => {
        const nonExistentId = (await gameModel.create(fakeGame))._id.toString();
        await gameModel.deleteMany({});
        await expect(service.updateGame(nonExistentId, { name: 'New Name' })).rejects.toThrow(NotFoundException);
    });

    it('deleteGame() should delete the game', async () => {
        const createdGame = await gameModel.create(fakeGame);
        await service.deleteGame(createdGame._id);
        expect(await gameModel.countDocuments()).toEqual(0);
    });

    it('deleteGame() should fail if the game does not exist', async () => {
        const nonExistentId = new gameModel()._id.toString();
        await expect(service.deleteGame(nonExistentId)).rejects.toThrow(NotFoundException);
    });

    it('deleteGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'findByIdAndDelete').mockResolvedValueOnce(null);
        await expect(service.deleteGame(fakeGame._id)).rejects.toBeTruthy();
    });

    it('deleteGamesByOwner() should remove every game owned by the user', async () => {
        await gameModel.create({ ...fakeGame, name: 'Owner Game 1', owner: { userId: 'owner-1', userName: 'OWNER-1' } });
        await gameModel.create({ ...fakeGame, name: 'Owner Game 2', owner: { userId: 'owner-1', userName: 'OWNER-1' } });
        await gameModel.create({ ...fakeGame, name: 'Other Owner Game', owner: { userId: 'owner-2', userName: 'OWNER-2' } });

        await service.deleteGamesByOwner('owner-1');
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect(await gameModel.countDocuments({ 'owner.userId': 'owner-1' })).toEqual(0);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect(await gameModel.countDocuments({ 'owner.userId': 'owner-2' })).toEqual(1);
    });

    it('updateOwnerUsername() should update owner username on every owned game', async () => {
        await gameModel.create({ ...fakeGame, name: 'Owner Game 1', owner: { userId: 'owner-1', userName: 'OLD' } });
        await gameModel.create({ ...fakeGame, name: 'Owner Game 2', owner: { userId: 'owner-1', userName: 'OLD' } });
        await gameModel.create({ ...fakeGame, name: 'Other Owner Game', owner: { userId: 'owner-2', userName: 'OTHER' } });

        await service.updateOwnerUsername('owner-1', 'NEW-NAME');
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const updatedGames = await gameModel.find({ 'owner.userId': 'owner-1' }).exec();
        expect(updatedGames.every((game) => game.owner.userName === 'NEW-NAME')).toBe(true);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const unaffectedGame = await gameModel.findOne({ 'owner.userId': 'owner-2' }).exec();
        expect(unaffectedGame.owner.userName).toBe('OTHER');
    });

    it('isNameUnique() should return true if name is unique', async () => {
        const name = 'Unique Name';
        expect(await service.isNameUnique(name)).toBeTruthy();
    });

    it('isNameUnique() should return false if name is not unique', async () => {
        const name = 'Not Unique Name';
        await gameModel.create({ ...fakeGame, name });
        expect(await service.isNameUnique(name)).toBeFalsy();
    });

    it('isNameUnique() should throw BadRequestException if name is empty', async () => {
        await expect(service.isNameUnique('')).rejects.toThrow(BadRequestException);
    });
});
