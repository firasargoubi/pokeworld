import { Injectable } from '@angular/core';
import { MapVisualData } from '@app/interfaces/map-visual-data';
import { TileVisualData } from '@app/interfaces/tile-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ItemType } from '@common/item-type.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

// TODO refactor board visual service

@Injectable({
    providedIn: 'root',
})
export class BoardVisualService {
    visualMapData: MapVisualData;
    mapUpdateSubscription = this.gameDataService.mapUpdate.subscribe((x) => this.onMapUpdate(x));

    constructor(public gameDataService: GameDataService) {
        this.updateAllTiles();
    }

    getTileImage(tiles: TileType[][], pos: Position): string {
        switch (this.getTile(tiles, pos)) {
            case TileType.Water:
                return `/assets/images/game/tiles/water/water-${this.getWaterImage(tiles, pos)}.png`;
            case TileType.Bush:
                return '/assets/images/game/tiles/bush.png';
            case TileType.Path:
                return `/assets/images/game/tiles/path/path-${this.getPathImage(tiles, pos)}.png`;
            case TileType.Bridge:
                return `/assets/images/game/tiles/bridge/bridge-${this.getBridgeImage(tiles, pos)}.png`;
            case TileType.BrokenBridge:
                return `/assets/images/game/tiles/broken-bridge/bridge-${this.getBridgeImage(tiles, pos)}.png`;
            default:
                return `/assets/images/game/tiles/grass/grass-${this.getGrassImage(pos)}.png`;
        }
    }

    private onMapUpdate(pos: Position | null) {
        if (pos === null) {
            this.updateAllTiles();
        } else {
            this.updateSuroundingTiles(pos);
        }
    }

    private updateSuroundingTiles(pos: Position) {
        const deltaPositions: Position[] = [
            { x: -1, y: -1 },
            { x: -1, y: 0 },
            { x: -1, y: 1 },
            { x: 0, y: -1 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
        ];

        deltaPositions.forEach((deltaPosition) => {
            this.updateTile({ x: pos.x + deltaPosition.x, y: pos.y + deltaPosition.y });
        });
    }

    private updateAllTiles() {
        const mapSize = this.gameDataService.gameData.mapData.size;
        const defaultTile = '/assets/images/game/tiles/grass.png';

        this.visualMapData = {
            tiles: Array.from(Array(mapSize), () => Array(mapSize).fill(defaultTile)),
            size: mapSize,
        };

        for (let x = 0; x < mapSize; x++) {
            for (let y = 0; y < mapSize; y++) {
                this.updateTile({ x, y });
            }
        }
    }

    private updateTile(pos: Position) {
        const tiles = this.gameDataService.gameData.mapData.tiles;

        if (this.isOutOfBound(tiles, pos)) {
            return;
        }

        const newTileVisualData = this.getTileVisualData(tiles, pos);
        const oldTileVisualData = this.visualMapData.tiles[pos.x][pos.y];

        const isTileEqual = oldTileVisualData.tile === newTileVisualData.tile;
        const isUnderlayEqual = oldTileVisualData.underlay === newTileVisualData.underlay;
        const isItemEqual = oldTileVisualData.item === newTileVisualData.item;

        if (isTileEqual && isUnderlayEqual && isItemEqual) {
            return;
        }

        this.visualMapData.tiles[pos.x][pos.y] = newTileVisualData;
    }

    private isOutOfBound(tiles: TileType[][], pos: Position): boolean {
        const isSmallerThanZero = pos.x < 0 || pos.y < 0;
        const isHigherThanLength = pos.x >= tiles.length || pos.x < 0 || pos.y >= tiles[pos.x].length;

        return isSmallerThanZero || isHigherThanLength;
    }

    private getTileVisualData(tiles: TileType[][], pos: Position): TileVisualData {
        return {
            tile: this.getTileImage(tiles, pos),
            underlay: this.getUnderlayImage(tiles, pos),
            item: this.getItemImage(pos),
        };
    }

    private getItemImage(pos: Position): string {
        const items: Record<ItemType, Position[]> = this.gameDataService.gameData.mapData.items;

        for (const itemType of Object.values(ItemType)) {
            const itemPositions: Position[] = items[itemType];

            const isItemInTile = itemPositions.some((itemPos) => {
                return itemPos.x === pos.x && itemPos.y === pos.y;
            });

            if (isItemInTile) {
                return `/assets/images/game/items/${itemType.toLowerCase()}.png`;
            }
        }

        return '';
    }

    private getUnderlayImage(tiles: TileType[][], pos: Position): string {
        switch (this.getTile(tiles, pos)) {
            case TileType.Water:
            case TileType.BrokenBridge:
                return `/assets/images/game/tiles/tide/tide-${this.getTideImage(pos)}.png`;
            case TileType.Bridge:
                return '/assets/images/game/tiles/tide/tide-0.png';
            default:
                return '';
        }
    }

    private getTile(tiles: TileType[][], pos: Position): TileType {
        if (this.isOutOfBound(tiles, pos)) {
            return TileType.None;
        }

        return tiles[pos.x][pos.y];
    }

    private getWaterImage(tiles: TileType[][], pos: Position): string {
        const deltaPositions = [
            { x: -1, y: -1 },
            { x: -1, y: 0 },
            { x: -1, y: 1 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
        ];

        const similarTiles = [TileType.Water, TileType.None, TileType.Bridge, TileType.BrokenBridge];

        const surroundingTiles = this.compareTiles(tiles, pos, deltaPositions, similarTiles);

        return surroundingTiles.map((b) => (b ? '0' : '1')).join('');
    }

    private getPathImage(tiles: TileType[][], pos: Position): string {
        const deltaPositions = [
            { x: -1, y: -1 },
            { x: -1, y: 0 },
            { x: -1, y: 1 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
        ];

        const similarTiles = [TileType.Path, TileType.None, TileType.Bridge, TileType.BrokenBridge];

        const surroundingTiles = this.compareTiles(tiles, pos, deltaPositions, similarTiles);

        return surroundingTiles.map((b) => (b ? '0' : '1')).join('');
    }

    private getBridgeImage(tiles: TileType[][], pos: Position): string {
        const deltaPositions = [
            { x: -1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: 0 },
        ];

        const similarTiles = [TileType.Water];
        const surroundingTiles = this.compareTiles(tiles, pos, deltaPositions, similarTiles);

        if (surroundingTiles.toString() === [false, true, true, false].toString()) {
            return '1';
        }

        if (surroundingTiles.toString() === [true, false, false, true].toString()) {
            return '2';
        }

        return '0';
    }

    private getGrassImage(pos: Position): string {
        const max = 37;

        return this.getRandomString(pos, max);
    }

    private getTideImage(pos: Position): string {
        const max = 47;

        return this.getRandomString(pos, max);
    }

    private getRandomString(pos: Position, max: number): string {
        const base = 5;
        const multiplier = 31;

        const randomNumber = base + (pos.x + pos.y * this.visualMapData.size) * multiplier;

        return (randomNumber % (max + 1)).toString();
    }

    private compareTiles(tiles: TileType[][], pos: Position, deltaPositions: Position[], tileTypes: TileType[]): boolean[] {
        return deltaPositions.map((deltaPos) => {
            const newPos = { x: pos.x + deltaPos.x, y: pos.y + deltaPos.y };

            return this.compareTile(tiles, newPos, tileTypes);
        });
    }

    private compareTile(tiles: TileType[][], pos: Position, tileTypes: TileType[]): boolean {
        const tile = this.getTile(tiles, pos);

        return tileTypes.includes(tile);
    }
}
