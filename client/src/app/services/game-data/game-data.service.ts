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
    gameData: GameData;
    mapUpdate: Subject<Position | null>;

    constructor() {
        this.mapUpdate = new Subject();
        this.gameData = DEFAULT_GAME;
    }

    resetMap() {
        this.gameData.mapData.tiles = Array.from({ length: this.gameData.mapData.size }, () =>
            Array(this.gameData.mapData.size).fill(TileType.Grass),
        );
        this.mapUpdate.next(null);
    }

    createGameData(size: MapSize, mode: GameMode) {
        this.gameData = DEFAULT_GAME;
        this.gameData.mapData.size = size;
        this.gameData.mapData.gameMode = mode;
        this.resetMap();
        this.mapUpdate.next(null);
    }

    setGameData(gameData: GameData) {
        this.gameData = gameData;
        this.mapUpdate.next(null);
    }

    editTile(tile: TileType, pos: Position) {
        this.gameData.mapData.tiles[pos.x][pos.y] = tile;
        this.mapUpdate.next(pos);
    }

    addItem(item: ItemType, pos: Position) {
        this.removeItem(pos);
        this.gameData.mapData.items[item].push(pos);
        this.mapUpdate.next(pos);
    }

    removeItem(pos: Position) {
        for (const item of Object.values(ItemType)) {
            this.gameData.mapData.items[item] = this.gameData.mapData.items[item].filter((itemPos) => {
                return itemPos.x !== pos.x || itemPos.y !== pos.y;
            });
        }

        this.mapUpdate.next(pos);
    }

    getItemCount(item: ItemType): number {
        return this.gameData.mapData.items[item].length;
    }

    getName(): string {
        return this.gameData.name;
    }

    getDescription(): string {
        return this.gameData.description;
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

    getItem(targetPos: Position): ItemType | null {
        for (const item of Object.values(ItemType)) {
            for (const pos of this.gameData.mapData.items[item]) {
                if (targetPos.x === pos.x && targetPos.y === pos.y) {
                    return item;
                }
            }
        }

        return null;
    }

    // TODO handle case where pos is out of bound
    getTile(pos: Position) {
        return this.gameData.mapData.tiles[pos.x][pos.y];
    }
}
