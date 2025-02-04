import { Body, Controller, Get, Param, Delete, Patch, Post, Res, HttpStatus } from '@nestjs/common';
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
        const allGames = await this.gameService.getAllGames();
        response.status(HttpStatus.OK).json(allGames);
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
        const game = await this.gameService.getGame(id);
        response.status(HttpStatus.OK).json(game);
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
        delete gameDto._id;
        const newGame = await this.gameService.addGame(gameDto);
        response.status(HttpStatus.CREATED).json(newGame);
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
        const updatedGame = await this.gameService.updateGame(id, updateGameDto);
        response.status(HttpStatus.OK).json(updatedGame);
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
        const updatedGame = await this.gameService.toggleVisibility(id);
        response.status(HttpStatus.OK).json(updatedGame);
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
        await this.gameService.deleteGame(id);
        response.status(HttpStatus.NO_CONTENT).send();
    }
}
