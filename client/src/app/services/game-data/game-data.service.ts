import { Injectable } from '@angular/core';
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
        // TODO TEMP

        this.gameData = {
            _id: 'GameId',
            name: 'GameTitle',
            description: 'GameDescription',
            lastEdited: new Date(),
            isVisible: true,
            mapData: {
                items: {
                    [ItemType.Item1]: [{ x: 5, y: 5 }],
                    [ItemType.Item2]: [{ x: 6, y: 6 }],
                    [ItemType.Item3]: [],
                    [ItemType.Item4]: [],
                    [ItemType.Item5]: [],
                    [ItemType.Item6]: [],
                    [ItemType.Random]: [],
                    [ItemType.Spawn]: [],
                    [ItemType.Flag]: [],
                },
                tiles: [
                    [
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.BrokenBridge,
                        TileType.Water,
                        TileType.Bridge,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                    ],
                    [
                        TileType.Grass,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Bridge,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Water,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Grass,
                        TileType.BrokenBridge,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Water,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Water,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                    [
                        TileType.Water,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Bridge,
                        TileType.BrokenBridge,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                ],
                size: MapSize.Small,
                gameMode: GameMode.FFA,
            },
            thumbnail: 'thumbnail.png',
        };
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
