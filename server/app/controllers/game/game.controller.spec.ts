import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';
import { GameService } from '@app/services/game/game.service';
import { Game } from '@app/model/schema/game.schema';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

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

    // CHECK TEST FORMAT FOR CONTROLLER
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

    // CHECK DELETE SPECIFIC ERRORS TESTS
    // it('allGames() should return INTERNAL_SERVER_ERROR when service fails', async () => {
    //     gameService.getAllGames.rejects();

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.allGames(res);
    // });

    it('getGame() should return a game by ID', async () => {
        const fakeGame = new Game();
        gameService.getGame.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(fakeGame);
            return res;
        };

        await controller.getGame('valid_id', res);
    });

    // it('getGame() should return BAD_REQUEST when ID is invalid', async () => {
    //     gameService.getGame.rejects(new BadRequestException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.BAD_REQUEST);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.getGame('Bad request', res);
    // });

    // it('getGame() should return NOT_FOUND when game not found', async () => {
    //     gameService.getGame.rejects(new NotFoundException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.NOT_FOUND);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.getGame('nonexistent_id', res);
    // });

    // it('getGame() should return INTERNAL_SERVER_ERROR when service fails', async () => {
    //     gameService.getGame.rejects(new InternalServerErrorException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.getGame('valid_id', res);
    // });

    it('saveGame() should create or update a game', async () => {
        const fakeGame = new Game();
        gameService.saveGame.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(fakeGame);
            return res;
        };

        await controller.saveGame({} as Game, res);
    });

    it('addGame() should create a new game', async () => {
        const fakeGame = new Game();
        gameService.addGame.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(fakeGame);
            return res;
        };

        await controller.addGame({} as Game, res);
    });

    // it('addGame() should return BAD_REQUEST when game name already exists', async () => {
    //     gameService.addGame.rejects(new BadRequestException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.BAD_REQUEST);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.addGame({} as Game, res);
    // });

    // it('addGame() should return INTERNAL_SERVER_ERROR when service fails', async () => {
    //     gameService.addGame.rejects(new InternalServerErrorException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.addGame({} as Game, res);
    // });

    it('updateGame() should update a game', async () => {
        const fakeGame = new Game();
        gameService.updateGame.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(fakeGame);
            return res;
        };

        await controller.updateGame('valid_id', {} as Game, res);
    });

    // it('updateGame() should return BAD_REQUEST when ID is invalid', async () => {
    //     gameService.updateGame.rejects(new BadRequestException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.BAD_REQUEST);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.updateGame('invalid_id', {} as Game, res);
    // });

    // it('updateGame() should return NOT_FOUND when game not found', async () => {
    //     gameService.updateGame.rejects(new NotFoundException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.NOT_FOUND);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.updateGame('nonexistent_id', {} as Game, res);
    // });

    // it('updateGame() should return InternalServerError when service fails', async () => {
    //     gameService.updateGame.rejects(new InternalServerErrorException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.updateGame('valid_id', {} as Game, res);
    // });

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

    // it('toggleVisibility() should return BAD_REQUEST when ID is invalid', async () => {
    //     gameService.toggleVisibility.rejects(new BadRequestException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.BAD_REQUEST);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.toggleVisibility('', res);
    // });

    // it('toggleVisibility() should return NOT_FOUND when game not found', async () => {
    //     gameService.toggleVisibility.rejects(new NotFoundException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.NOT_FOUND);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.toggleVisibility('', res);
    // });

    // it('toggleVisibility() should return INTERNAL_SERVER_ERROR when service fails', async () => {
    //     gameService.toggleVisibility.rejects(new InternalServerErrorException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.toggleVisibility('', res);
    // });

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

    // it('deleteGame() should return BAD_REQUEST when ID is invalid', async () => {
    //     gameService.deleteGame.rejects(new BadRequestException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.BAD_REQUEST);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.deleteGame('invalid_id', res);
    // });

    // it('deleteGame() should return NOT_FOUND when game not found', async () => {
    //     gameService.deleteGame.rejects(new NotFoundException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.NOT_FOUND);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.deleteGame('', res);
    // });

    // it('deleteGame() should return INTERNAL_SERVER_ERROR when service fails', async () => {
    //     gameService.deleteGame.rejects(new InternalServerErrorException());

    //     const res = {} as unknown as Response;
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    //         return res;
    //     };
    //     res.send = () => res;

    //     await controller.deleteGame('', res);
    // });
});
