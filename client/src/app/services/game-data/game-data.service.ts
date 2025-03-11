import { Injectable } from '@angular/core';
import { DEFAULT_GAME } from '@app/consts/default-game';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameDataService {
    gameData: GameData = DEFAULT_GAME;
    mapUpdate: Subject<Position | null> = new Subject();
    itemUpdate: Subject<ItemType | null> = new Subject();

    createNewGame(size: MapSize, mode: GameMode) {
        const newGameData = structuredClone(DEFAULT_GAME);
        newGameData.mapData.size = size;
        newGameData.mapData.gameMode = mode;
        newGameData.mapData.tiles = Array.from({ length: size }, () => {
            return Array.from({ length: size }, () => TileType.Grass);
        });
        this.setGameData(newGameData);
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

    removeItem(position: Position): void {
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
