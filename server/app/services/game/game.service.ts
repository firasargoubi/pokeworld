import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Game } from '@app/model/schema/game.schema';
import { GameMode } from '@common/game-mode.enum'; // DELETE LATER
import { ItemType } from '@common/item-type.enum'; // DELETE LATER
import { MapSize } from '@common/map-size.enum'; // DELETE LATER

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {
        // this.resetDB(); // UNCOMMENT WHEN YOU WANT TO RESET AND REPOPULATE THE DB
    }
    async getAllGames(): Promise<Game[]> {
        return this.gameModel.find().exec();
    }

    async getGame(id: string): Promise<Game> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid ID format: ${id}`);
        }
        const game = await this.gameModel.findById(id).exec();
        if (!game) {
            throw new NotFoundException(`Game with ID ${id} not found.`);
        }
        return game;
    }

    async saveGame(gameDto: CreateGameDto): Promise<Game> {
        if (gameDto._id) {
            const existingGame = await this.gameModel.findById(gameDto._id).exec();
            if (existingGame) {
                return this.updateGame(gameDto._id, gameDto);
            }
        }
        delete gameDto._id;
        return this.addGame(gameDto);
    }

    async addGame(createGameDto: CreateGameDto): Promise<Game> {
        if (!(await this.isNameUnique(createGameDto.name))) {
            throw new BadRequestException(`Game with name ${createGameDto.name} already exists.`);
        }
        try {
            return await this.gameModel.create(createGameDto);
        } catch (error) {
            throw new BadRequestException(`Failed to insert game: ${error.message}`);
        }
    }

    async updateGame(id: string, updateGameDto: UpdateGameDto): Promise<Game> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid ID format: ${id}`);
        }
        if (!(await this.isNameUnique(updateGameDto.name, id))) {
            throw new BadRequestException(`Game with name ${updateGameDto.name} already exists.`);
        }
        const updatedGame = await this.gameModel.findByIdAndUpdate(id, updateGameDto, { new: true }).exec();
        if (!updatedGame) {
            throw new NotFoundException(`Game with ID ${id} not found.`);
        }
        return updatedGame;
    }

    async toggleVisibility(id: string): Promise<Game> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid ID format: ${id}`);
        }
        const game = await this.gameModel.findById(id).exec();
        if (!game) {
            throw new NotFoundException(`Game with ID ${id} not found.`);
        }
        game.isVisible = !game.isVisible;
        return game.save();
    }

    async deleteGame(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid ID format: ${id}`);
        }
        const result = await this.gameModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Game with ID ${id} not found.`);
        }
    }

    async isNameUnique(name: string, exceptId?: string): Promise<boolean> {
        if (exceptId) {
            return (await this.gameModel.find({ name, _id: { $ne: exceptId } }).exec()).length === 0;
        } else {
            return (await this.gameModel.find({ name }).exec()).length === 0;
        }
    }

    async populateDB(): Promise<void> {
        const games: CreateGameDto[] = [
            {
                name: 'Game 1',
                description: 'Description of Game 1',
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
            },
            {
                name: 'Game 2',
                description: 'Description of Game 2',
                lastEdited: new Date(),
                isVisible: true,
                thumbnail: '/assets/images/game/tiles/water.png',
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
                    size: MapSize.Medium,
                    gameMode: GameMode.CTF,
                },
            },
            {
                name: 'Game 3',
                description: 'Description of Game 3',
                lastEdited: new Date(),
                isVisible: true,
                thumbnail: '/assets/images/game/tiles/path.png',
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
                    size: MapSize.Large,
                    gameMode: GameMode.FFA,
                },
            },
            {
                name: 'Game 4',
                description: 'Description of Game 4',
                lastEdited: new Date(),
                isVisible: true,
                thumbnail: '/assets/images/game/tiles/water.png',
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
                    gameMode: GameMode.CTF,
                },
            },
            {
                name: 'Game 5',
                description: 'Description of Game 5',
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
                    size: MapSize.Medium,
                    gameMode: GameMode.FFA,
                },
            },
            {
                name: 'Game 6',
                description: 'Description of Game 6',
                lastEdited: new Date(),
                isVisible: true,
                thumbnail: '/assets/images/game/tiles/path.png',
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
                    size: MapSize.Large,
                    gameMode: GameMode.CTF,
                },
            },
        ];

        await this.gameModel.insertMany(games);
    }

    async deleteAllGames(): Promise<void> {
        await this.gameModel.deleteMany({}).exec();
    }

    async resetDB(): Promise<void> {
        await this.deleteAllGames();
        await this.populateDB();
    }
}
