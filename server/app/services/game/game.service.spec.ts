import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameService } from '@app/services/game/game.service';

import { MapSize } from '@common/map-size.enum';
import { GameMode } from '@common/game-mode.enum';
import { Game, GameDocument, gameSchema } from '@app/model/schema/game.schema';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ItemType } from '@common/item-type.enum';

describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
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
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [GameService],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        await gameModel.deleteMany({});
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop({ doCleanup: true });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    it('getAllGames() should return all games in the database', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect((await service.getAllGames()).length).toBeGreaterThan(0);
    });

    it('toggleVisibility() should toggle the visibility of a game', async () => {
        const game = getFakeGame();
        const createdGame = await gameModel.create(game);
        await service.toggleVisibility(createdGame._id);
        const updatedGame = await gameModel.findById(createdGame._id);
        expect(updatedGame.isVisible).toBe(!createdGame.isVisible);
    });

    it('toggleVisibility() should fail if the game does not exist', async () => {
        const game = getFakeGame();
        await expect(service.toggleVisibility(game._id)).rejects.toBeTruthy();
    });

    it('toggleVisibility() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'findById').mockResolvedValueOnce(null);
        const game = getFakeGame();
        await expect(service.toggleVisibility(game._id)).rejects.toBeTruthy();
    });

    it('deleteGame() should delete the game', async () => {
        const game = getFakeGame();
        const createdGame = await gameModel.create(game);
        await service.deleteGame(createdGame._id);
        expect(await gameModel.countDocuments()).toEqual(0);
    });

    it('deleteGame() should fail if the game does not exist', async () => {
        const game = getFakeGame();
        await expect(service.deleteGame(game._id)).rejects.toBeTruthy();
    });

    it('deleteGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'findByIdAndDelete').mockResolvedValueOnce(null);
        const game = getFakeGame();
        await expect(service.deleteGame(game._id)).rejects.toBeTruthy();
    });
});

const getFakeGame = (): Game => ({
    name: 'Test Game',
    description: 'Test Description',
    lastEdited: new Date(),
    isVisible: true,
    thumbnail: '/assets/images/game/tiles/grass.png',
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
});
