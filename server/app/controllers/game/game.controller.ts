import { Body, Controller, Get, Param, Delete, Patch, Post, Res, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { GameService } from '@app/services/game/game.service';
import { Response } from 'express';
import {
    ApiTags,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiNoContentResponse,
    ApiInternalServerErrorResponse,
    ApiBadRequestResponse,
    ApiCreatedResponse,
} from '@nestjs/swagger';
import { Game } from '@app/model/schema/game.schema';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @ApiOkResponse({
        description: 'Returns all games',
        type: Game,
        isArray: true,
    })
    @ApiInternalServerErrorResponse({
        description: 'Returns INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = await this.gameService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns a game',
        type: Game,
    })
    @ApiBadRequestResponse({
        description: 'Returns BAD_REQUEST http status when _id is Invalid',
    })
    @ApiNotFoundResponse({
        description: 'Returns NOT_FOUND http status when _id not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Returns INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/:id')
    async getGame(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = await this.gameService.getGame(id);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            if (error instanceof BadRequestException) {
                response.status(HttpStatus.BAD_REQUEST).send(error.message);
            } else if (error instanceof NotFoundException) {
                response.status(HttpStatus.NOT_FOUND).send(error.message);
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
            }
        }
    }

    @ApiCreatedResponse({
        description: 'Creates a new game',
        type: Game,
    })
    @ApiBadRequestResponse({
        description: 'Returns BAD_REQUEST http status when game name already exists',
    })
    @ApiInternalServerErrorResponse({
        description: 'Returns INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Post('/')
    async addGame(@Body() gameDto: CreateGameDto, @Res() response: Response) {
        try {
            const newGame = await this.gameService.addGame(gameDto);
            response.status(HttpStatus.CREATED).json(newGame);
        } catch (error) {
            if (error instanceof BadRequestException) {
                response.status(HttpStatus.BAD_REQUEST).send(error.message);
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
            }
        }
    }

    @ApiOkResponse({
        description: 'Updates a game',
        type: Game,
    })
    @ApiBadRequestResponse({
        description: 'Returns BAD_REQUEST http status when _id is Invalid or game name already exists',
    })
    @ApiNotFoundResponse({
        description: 'Returns NOT_FOUND http status when _id not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Returns INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Patch('/:id')
    async updateGame(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto, @Res() response: Response) {
        try {
            const updatedGame = await this.gameService.updateGame(id, updateGameDto);
            response.status(HttpStatus.OK).json(updatedGame);
        } catch (error) {
            if (error instanceof BadRequestException) {
                response.status(HttpStatus.BAD_REQUEST).send(error.message);
            } else if (error instanceof NotFoundException) {
                response.status(HttpStatus.NOT_FOUND).send(error.message);
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
            }
        }
    }

    @ApiOkResponse({
        description: 'Toggles the visibility of a game',
        type: Game,
    })
    @ApiBadRequestResponse({
        description: 'Returns BAD_REQUEST http status when _id is Invalid',
    })
    @ApiNotFoundResponse({
        description: 'Returns NOT_FOUND http status when _id not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Returns INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Patch('/:id/toggle')
    async toggleVisibility(@Param('id') id: string, @Res() response: Response) {
        try {
            const updatedGame = await this.gameService.toggleVisibility(id);
            response.status(HttpStatus.OK).json(updatedGame);
        } catch (error) {
            if (error instanceof BadRequestException) {
                response.status(HttpStatus.BAD_REQUEST).send(error.message);
            } else if (error instanceof NotFoundException) {
                response.status(HttpStatus.NOT_FOUND).send(error.message);
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
            }
        }
    }

    @ApiNoContentResponse({
        description: 'Deletes a game',
    })
    @ApiBadRequestResponse({
        description: 'Returns BAD_REQUEST http status when _id is Invalid',
    })
    @ApiNotFoundResponse({
        description: 'Returns NOT_FOUND http status when _id not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Returns INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Delete('/:id')
    async deleteGame(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gameService.deleteGame(id);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            if (error instanceof BadRequestException) {
                response.status(HttpStatus.BAD_REQUEST).send(error.message);
            } else if (error instanceof NotFoundException) {
                response.status(HttpStatus.NOT_FOUND).send(error.message);
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
            }
        }
    }
}
