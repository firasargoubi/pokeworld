import { inject, Injectable } from '@angular/core';
import { DEFAULT_GAME_DATA } from '@app/consts/game-data.const';
import { GameData } from '@common/interfaces/game-data';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { firstValueFrom, Subject } from 'rxjs';
import { UserService } from '@app/services/user/user.service';
import { Owner } from '@common/interfaces/owner';
import { GameState } from '@common/interfaces/game-state.enum';
import { GameSaveService } from '@app/services/game-save/game-save.service';

@Injectable({
    providedIn: 'root',
})
export class GameDataService {
    gameData: GameData = structuredClone(DEFAULT_GAME_DATA);
    mapUpdate: Subject<Position | null> = new Subject();
    itemUpdate: Subject<ItemType | null> = new Subject();
    private readonly userService = inject(UserService);
    private readonly gameSaveService = inject(GameSaveService);

    isOwner(owner: Owner) {
        if (!owner) {
            return true; // temporary before adding owners to games without owners (before change of schema)
        }
        let currentUserId;
        this.userService.user$.subscribe((user) => (currentUserId = user?.userId));
        const ownerUserId = owner?.userId;
        return currentUserId === ownerUserId;
    }

    createNewGame(size: MapSize, mode: GameMode) {
        const newGameData = structuredClone(DEFAULT_GAME_DATA);
        newGameData.mapData.size = size;
        newGameData.mapData.gameMode = mode;
        newGameData.mapData.tiles = Array.from({ length: size }, () => {
            return Array.from({ length: size }, () => TileType.Grass);
        });
        this.setGameOwner(newGameData);
        this.setGameData(newGameData);
    }

    async duplicateGame(game: GameData) {
        const duplicateGame = structuredClone(game);
        duplicateGame._id = '';
        duplicateGame.name = await this.getNewGameName(game.name);
        this.setGameOwner(duplicateGame);
        duplicateGame.gameState = GameState.PRIVATE;
        this.setGameData(duplicateGame);
    }

    async getNewGameName(gameName: string) {
        let i = 0;
        const prefixName = `${gameName}_copie`;
        gameName = prefixName;
        while (!(await firstValueFrom(this.gameSaveService.isNameUnique(gameName)))) {
            gameName = `${prefixName}${i}`;
            i++;
        }
        return gameName;
    }

    setGameOwner(game: GameData) {
        this.userService.user$.subscribe((user) => {
            if (user != null) {
                game.owner = { userId: user.userId, userName: user.username };
            }
        });
    }

    setGameData(gameData: GameData) {
        this.gameData = gameData;
        this.mapUpdate.next(null);
        this.itemUpdate.next(null);
    }

    editTile(tile: TileType, position: Position) {
        this.gameData.mapData.tiles[position.x][position.y] = tile;
        this.mapUpdate.next(position);
    }

    addItem(item: ItemType, position: Position) {
        this.removeItem(position);
        this.gameData.mapData.items[item].push(position);

        this.mapUpdate.next(position);
        this.itemUpdate.next(item);
    }

    removeItem(position: Position) {
        const getItemResult = this.getItem(position);
        if (!getItemResult) {
            return;
        }
        const item = getItemResult as ItemType;

        this.gameData.mapData.items[item] = this.gameData.mapData.items[item].filter((itemPosition) => {
            return itemPosition.x !== position.x || itemPosition.y !== position.y;
        });

        this.mapUpdate.next(position);
        this.itemUpdate.next(item);
    }

    getItemCount(item: ItemType): number {
        return this.gameData.mapData.items[item].length;
    }

    getMapSize(): MapSize {
        return this.gameData.mapData.size;
    }

    getMapSizeString(): string {
        const mapSize = this.gameData.mapData.size;
        return `${mapSize} x ${mapSize}`;
    }

    getGameMode(): GameMode {
        return this.gameData.mapData.gameMode;
    }

    getGameModeString(): string {
        return this.gameData.mapData.gameMode;
    }

    getItem(position: Position): ItemType | null {
        for (const item of Object.values(ItemType)) {
            for (const itemPosition of this.gameData.mapData.items[item]) {
                if (position.x === itemPosition.x && position.y === itemPosition.y) {
                    return item;
                }
            }
        }

        return null;
    }

    getTileFromPosition(position: Position): TileType {
        return this.getTile(this.gameData.mapData.tiles, position);
    }

    getTile(tiles: TileType[][], position: Position): TileType {
        if (this.isOutOfBound(tiles, position)) {
            return TileType.None;
        }

        return tiles[position.x][position.y];
    }

    isOutOfBound(tiles: TileType[][], position: Position): boolean {
        const isSmallerThanZero = position.x < 0 || position.y < 0;
        const isHigherThanLength = position.x >= tiles.length || position.x < 0 || position.y >= tiles[position.x].length;

        return isSmallerThanZero || isHigherThanLength;
    }

    isMapValid(): boolean {
        const size = this.gameData.mapData.size;
        const tiles = this.gameData.mapData.tiles;
        if (tiles.length !== size) {
            return false;
        }

        for (const row of tiles) {
            if (row.length !== size) {
                return false;
            }
        }

        return true;
    }

    isModified(initialGameData: GameData): boolean {
        return JSON.stringify(this.gameData) !== JSON.stringify(initialGameData);
    }
}
