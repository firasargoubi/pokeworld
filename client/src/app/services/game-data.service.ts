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
    mapUpdate: Subject<Position | null> = new Subject();

    constructor() {
        // TODO TEMP

        this.gameData = {
            _id: 'GameId',
            name: 'GameTitle',
            description: 'GameDescription',
            lastEdited: new Date(),
            isVisible: true,
            mapData: {
                items: {
                    [ItemType.Item1]: [{ x: 9, y: 0 }],
                    [ItemType.Item2]: [{ x: 9, y: 1 }],
                    [ItemType.Item3]: [{ x: 9, y: 2 }],
                    [ItemType.Item4]: [{ x: 9, y: 3 }],
                    [ItemType.Item5]: [{ x: 9, y: 4 }],
                    [ItemType.Item6]: [{ x: 9, y: 5 }],
                    [ItemType.Random]: [{ x: 9, y: 6 }],
                    [ItemType.Spawn]: [{ x: 9, y: 7 }],
                    [ItemType.Flag]: [{ x: 9, y: 8 }],
                },
                tiles: [
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
        this.gameData.mapData.items[item].push(pos);
        this.mapUpdate.next(pos);
    }

    removeItem(pos: Position) {
        for (const item of Object.values(ItemType)) {
            this.gameData.mapData.items[item] = this.gameData.mapData.items[item].filter((itemPos) => {
                return itemPos.x !== pos.x && itemPos.y !== pos.y;
            });
        }

        this.mapUpdate.next(pos);
    }
}
