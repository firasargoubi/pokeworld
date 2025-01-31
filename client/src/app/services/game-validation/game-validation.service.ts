import { Injectable } from '@angular/core';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { ValidationErrors } from '@app/interfaces/game-validation-errors';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

const MAX_NAME_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 350;

@Injectable({
    providedIn: 'root',
})
export class GameValidationService {
    private validationErrors: ValidationErrors;
    private tilesCount: {
        nbWater: number;
        nbBridge: number;
        nbTerrain: number;
        nbTilesTotal: number;
    };

    constructor() {
        this.tilesCount = {
            nbWater: 0,
            nbBridge: 0,
            nbTerrain: 0,
            nbTilesTotal: 0,
        };
        this.validationErrors = {
            name: {
                isValid: true,
                errorCode: null,
            },
            description: {
                isValid: true,
                errorCode: null,
            },
            terrainCoverage: {
                isValid: true,
                coveragePercentage: 100,
            },
            bridge: {
                isValid: true,
                errors: [],
            },
            spawnPoint: {
                isValid: true,
                spawnPointMissing: 0,
                nonAccessibleSpawnPoint: [],
            },
            tilesAccessibility: {
                isValid: true,
                nonAccessibleTileCount: 0,
            },
            mode: {
                isValid: true,
                errorCode: null,
            },
        };
    }

    validateGame(game: GameData): boolean {
        this.validateName(game.name);
        this.validateDescription(game.description);
        this.validateMap(game.mapData);

        return Object.values(this.validationErrors).every((error) => error.isValid);
    }

    validateName(gameName: string): void {
        this.validateField(gameName, MAX_NAME_LENGTH, 'name');
    }

    validateDescription(gameDescription: string): void {
        this.validateField(gameDescription, MAX_DESCRIPTION_LENGTH, 'description');
    }

    validateField(value: string, maxLength: number, field: 'name' | 'description'): void {
        if (!value || value.trim() === '') {
            this.validationErrors[field].isValid = false;
            this.validationErrors[field].errorCode = ErrorCode.Empty;
        } else if (value.length > maxLength) {
            this.validationErrors[field].isValid = false;
            this.validationErrors[field].errorCode = ErrorCode.TooLong;
        }
    }

    validateMap(map: MapData): void {
        for (let x = 0; x < map.tiles.length; x++) {
            for (let y = 0; y < map.tiles[x].length; y++) {
                const position: Position = { x, y };
                this.handleTiles(position, map);
            }
        }
        this.validateTerrainCoverage();
        this.validateTilesAccessibility(map);
        this.validateSpawnPoints(map);
        if (map.gameMode === GameMode.CTF) {
            this.validateFlags(map);
        }
    }

    handleTiles(position: Position, map: MapData): void {
        const tileType = map.tiles[position.x][position.y];
        this.tilesCount.nbTilesTotal++;

        if (tileType === TileType.Water) {
            this.tilesCount.nbWater++;
        } else if (this.isBridge(tileType)) {
            this.validateBridges(position, map);
            this.tilesCount.nbBridge++;
        } else if (tileType === TileType.Grass || tileType === TileType.Path || tileType === TileType.Bush) {
            this.tilesCount.nbTerrain++;
        }
    }

    validateTerrainCoverage(): void {
        const MIN_TERRAIN_RATIO = 0.5;
        const PERCENTAGE_FACTOR = 100;

        const currentTerrainRatio = this.tilesCount.nbTerrain / this.tilesCount.nbTilesTotal;

        this.validationErrors.terrainCoverage = {
            isValid: currentTerrainRatio > MIN_TERRAIN_RATIO,
            coveragePercentage: currentTerrainRatio * PERCENTAGE_FACTOR,
        };
    }

    validateTilesAccessibility(map: MapData): void {
        const rows = map.tiles.length;
        const cols = map.tiles[0].length;
        const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

        let startX = -1;
        let startY = -1;
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                if (this.canTraverseTile(map.tiles[x][y], true)) {
                    startX = x;
                    startY = y;
                    break;
                }
            }
            if (startX !== -1) break;
        }

        this.dfs(map, startX, startY, visited);
        const visitedCount = visited.flat().reduce((count, tile) => count + (tile ? 1 : 0), 0) + 1;

        if (visitedCount < this.tilesCount.nbTerrain + this.tilesCount.nbBridge) {
            this.validationErrors.tilesAccessibility.isValid = false;
            this.validationErrors.tilesAccessibility.nonAccessibleTileCount = this.tilesCount.nbBridge + this.tilesCount.nbTerrain - visitedCount;
        }
    }

    validateSpawnPoints(map: MapData): void {
        const placedSpawnPoints = map.items[ItemType.Spawn].length;
        const requiredSpawnPoints = this.getRequiredSpawnPoints(map.size);

        if (placedSpawnPoints !== requiredSpawnPoints) {
            this.validationErrors.spawnPoint.isValid = false;
            this.validationErrors.spawnPoint.spawnPointMissing = requiredSpawnPoints - placedSpawnPoints;
        }

        for (const spawnPoint of map.items[ItemType.Spawn]) {
            if (!this.canTraverseTile(map.tiles[spawnPoint.x][spawnPoint.y], false)) {
                this.validationErrors.spawnPoint.isValid = false;
                this.validationErrors.spawnPoint.nonAccessibleSpawnPoint.push(spawnPoint);
            }
        }
    }

    validateFlags(map: MapData): void {
        const placedFlag = map.items[ItemType.Flag].length;

        if (placedFlag !== 1) {
            this.validationErrors.mode.isValid = false;
            if (placedFlag > 1) {
                this.validationErrors.mode.errorCode = ErrorCode.TooManyFlags;
            } else if (placedFlag < 1) {
                this.validationErrors.mode.errorCode = ErrorCode.NoFlags;
            }
        } else if (!this.canTraverseTile(map.tiles[map.items[ItemType.Flag][0].x][map.items[ItemType.Flag][0].y], false)) {
            this.validationErrors.mode.isValid = false;
            this.validationErrors.mode.errorCode = ErrorCode.MisplacedFlag;
        }
    }

    validateBridges(position: Position, map: MapData): void {
        if (this.isOnMapEdge(position, map)) {
            this.validationErrors.bridge.isValid = false;
            this.validationErrors.bridge.errors.push({ x: position.x, y: position.y, errorCode: ErrorCode.BridgeAtEdge });
        } else if (!this.isCorrectlyPlacedBridge(position, map)) {
            this.validationErrors.bridge.isValid = false;
            this.validationErrors.bridge.errors.push({ x: position.x, y: position.y, errorCode: ErrorCode.BridgeNotBetweenWalls });
        }
    }

    private dfs(map: MapData, x: number, y: number, visited: boolean[][]): void {
        if (x < 0 || x >= map.tiles.length || y < 0 || y >= map.tiles[0].length || visited[x][y] || !this.canTraverseTile(map.tiles[x][y], true)) {
            return;
        }
        visited[x][y] = true;

        this.dfs(map, x + 1, y, visited);
        this.dfs(map, x - 1, y, visited);
        this.dfs(map, x, y + 1, visited);
        this.dfs(map, x, y - 1, visited);
    }

    private getRequiredSpawnPoints(size: MapSize): number {
        const spawnPoints = {
            [MapSize.Small]: 2,
            [MapSize.Medium]: 4,
            [MapSize.Large]: 6,
        };

        return spawnPoints[size];
    }

    private isBridge(tileType: TileType): boolean {
        return tileType === TileType.Bridge || tileType === TileType.BrokenBridge;
    }

    private isOnMapEdge(position: Position, map: MapData): boolean {
        return position.x === 0 || position.x === map.tiles.length - 1 || position.y === 0 || position.y === map.tiles.length - 1;
    }

    private isCorrectlyPlacedBridge(position: Position, map: MapData): boolean {
        const x = position.x;
        const y = position.y;

        const isBetweenHorizontalWater =
            map.tiles[x]?.[y - 1] === TileType.Water &&
            map.tiles[x]?.[y + 1] === TileType.Water &&
            this.canTraverseTile(map.tiles[x - 1]?.[y], false) &&
            this.canTraverseTile(map.tiles[x + 1]?.[y], false);

        const isBetweenVerticalWater =
            map.tiles[x - 1]?.[y] === TileType.Water &&
            map.tiles[x + 1]?.[y] === TileType.Water &&
            this.canTraverseTile(map.tiles[x]?.[y - 1], false) &&
            this.canTraverseTile(map.tiles[x]?.[y + 1], false);

        return isBetweenHorizontalWater || isBetweenVerticalWater;
    }

    private canTraverseTile(tileType: TileType, isBridgeTraversable: boolean): boolean {
        if (isBridgeTraversable) {
            return tileType !== TileType.Water;
        } else {
            return tileType !== TileType.Water && !this.isBridge(tileType);
        }
    }
}
