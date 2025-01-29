import { Controller, Get, Param, Delete, Patch, Res, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { GameService } from '@app/services/game/game.service';
import { Response } from 'express';
import {
    ApiTags,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiNoContentResponse,
    ApiInternalServerErrorResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Game } from '@app/model/schema/game.schema';

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
