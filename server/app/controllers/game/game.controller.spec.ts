import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';
import { GameService } from '@app/services/game/game.service';
import { Game } from '@app/model/schema/game.schema';
import { Response } from 'express';
import { HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';

describe('GameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allGames() should return all games', async () => {
        const fakeGames = [new Game(), new Game()];
        gameService.getAllGames.resolves(fakeGames);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeGames);
            return res;
        };

        await controller.allGames(res);
    });

    it('allGames() should return INTERNAL_SERVER_ERROR when service fails', async () => {
        gameService.getAllGames.rejects(new Error('Service error'));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('Service error');
            return res;
        };

        await controller.allGames(res);
    });

    it('toggleVisibility() should toggle visibility of a game', async () => {
        const fakeGame = new Game();
        gameService.toggleVisibility.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(fakeGame);
            return res;
        };

        await controller.toggleVisibility('valid_id', res);
    });

    it('toggleVisibility() should return BAD_REQUEST when ID is invalid', async () => {
        gameService.toggleVisibility.rejects(new BadRequestException('Invalid ID format'));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('Invalid ID format');
            return res;
        };

        await controller.toggleVisibility('invalid_id', res);
    });

    it('toggleVisibility() should return NOT_FOUND when game not found', async () => {
        gameService.toggleVisibility.rejects(new NotFoundException('Game not found'));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('Game not found');
            return res;
        };

        await controller.toggleVisibility('nonexistent_id', res);
    });

    it('toggleVisibility() should return INTERNAL_SERVER_ERROR when service fails', async () => {
        gameService.toggleVisibility.rejects(new Error('Service error'));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('Service error');
            return res;
        };

        await controller.toggleVisibility('valid_id', res);
    });

    it('deleteGame() should delete a game', async () => {
        gameService.deleteGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;

        await controller.deleteGame('valid_id', res);
    });

    it('deleteGame() should return BAD_REQUEST when ID is invalid', async () => {
        gameService.deleteGame.rejects(new BadRequestException('Invalid ID format'));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('Invalid ID format');
            return res;
        };

        await controller.deleteGame('invalid_id', res);
    });

    it('deleteGame() should return NOT_FOUND when game not found', async () => {
        gameService.deleteGame.rejects(new NotFoundException('Game not found'));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('Game not found');
            return res;
        };

        await controller.deleteGame('nonexistent_id', res);
    });

    it('deleteGame() should return INTERNAL_SERVER_ERROR when service fails', async () => {
        gameService.deleteGame.rejects(new Error('Service error'));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('Service error');
            return res;
        };

        await controller.deleteGame('valid_id', res);
    });
});
