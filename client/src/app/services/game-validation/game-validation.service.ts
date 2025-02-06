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
const MIN_TERRAIN_RATIO = 0.5;
const PERCENTAGE_FACTOR = 100;
const REQUIRED_SPAWN_POINTS: Record<MapSize, number> = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};
const BRIDGE_TYPES = new Set([TileType.Bridge, TileType.BrokenBridge]);

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
            name: { isValid: true, errorCode: null },
            description: { isValid: true, errorCode: null },
            terrainCoverage: { isValid: true, coveragePercentage: 100 },
            bridge: { isValid: true, errors: [] },
            spawnPoint: { isValid: true, errorCode: null },
            tilesAccessibility: { isValid: true, nonAccessibleTileCount: 0 },
            mode: { isValid: true, errorCode: null },
            items: { isValid: true, misplacedItems: [] },
        };
    }

    validateGame(game: GameData): boolean {
        this.validateName(game.name);
        this.validateDescription(game.description);
        this.validateMap(game.mapData);

        return Object.values(this.validationErrors).every((error) => error.isValid);
    }

    validateName(gameName: string): boolean {
        return this.validateField(gameName, MAX_NAME_LENGTH, 'name');
    }

    validateDescription(gameDescription: string): boolean {
        return this.validateField(gameDescription, MAX_DESCRIPTION_LENGTH, 'description');
    }

    validateMap(map: MapData): boolean {
        const isMapValid = [];
        for (let x = 0; x < map.tiles.length; x++) {
            for (let y = 0; y < map.tiles[x].length; y++) {
                const position: Position = { x, y };
                this.handleTile(position, map);
            }
        }
        isMapValid.push(this.validationErrors.bridge.isValid);
        isMapValid.push(this.validateTerrainCoverage());
        isMapValid.push(this.validateTilesAccessibility(map));
        isMapValid.push(this.validateSpawnPoints(map));
        isMapValid.push(this.validateItemPlacement(map));
        if (map.gameMode === GameMode.CTF) {
            isMapValid.push(this.validateFlags(map));
        }

        return isMapValid.every((result) => result);
    }

    validateBridge(position: Position, map: MapData): boolean {
        if (this.isOnMapEdge(position, map)) {
            this.validationErrors.bridge.isValid = false;
            this.validationErrors.bridge.errors.push({ x: position.x, y: position.y, errorCode: ErrorCode.BridgeAtEdge });
            return false;
        } else if (!this.isCorrectlyPlacedBridge(position, map)) {
            this.validationErrors.bridge.isValid = false;
            this.validationErrors.bridge.errors.push({ x: position.x, y: position.y, errorCode: ErrorCode.BridgeNotBetweenWalls });
            return false;
        }
        return true;
    }

    validateSpawnPoints(map: MapData): boolean {
        return this.validateItemCount(map, ItemType.Spawn, REQUIRED_SPAWN_POINTS[map.size], this.validationErrors.spawnPoint);
    }

    validateFlags(map: MapData): boolean {
        return this.validateItemCount(map, ItemType.Flag, 1, this.validationErrors.mode);
    }

    validateItemPlacement(map: MapData): boolean {
        this.validationErrors.items.isValid = true;
        this.validationErrors.items.misplacedItems = [];

        for (const [, positions] of Object.entries(map.items)) {
            for (const position of positions) {
                if (!this.canTraverseTile(map.tiles[position.x][position.y], false)) {
                    this.validationErrors.items.misplacedItems.push(position);
                }
            }
        }
        this.validationErrors.items.isValid = this.validationErrors.items.misplacedItems.length === 0;
        return this.validationErrors.items.isValid;
    }

    private validateTerrainCoverage(): boolean {
        this.validationErrors.terrainCoverage.isValid = true;
        this.validationErrors.terrainCoverage.coveragePercentage = 100;

        const currentTerrainRatio = this.tilesCount.nbTerrain / this.tilesCount.nbTilesTotal;

        this.validationErrors.terrainCoverage = {
            isValid: currentTerrainRatio > MIN_TERRAIN_RATIO,
            coveragePercentage: currentTerrainRatio * PERCENTAGE_FACTOR,
        };

        return this.validationErrors.terrainCoverage.isValid;
    }

    private validateTilesAccessibility(map: MapData): boolean {
        this.validationErrors.tilesAccessibility.isValid = true;
        this.validationErrors.tilesAccessibility.nonAccessibleTileCount = 0;

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
        const visitedCount = visited.flat().reduce((count, tile) => count + (tile ? 1 : 0), 0);

        if (visitedCount < this.tilesCount.nbTerrain + this.tilesCount.nbBridge) {
            this.validationErrors.tilesAccessibility.isValid = false;
            this.validationErrors.tilesAccessibility.nonAccessibleTileCount = this.tilesCount.nbBridge + this.tilesCount.nbTerrain - visitedCount;
        }

        return this.validationErrors.tilesAccessibility.isValid;
    }

    private validateField(value: string, maxLength: number, field: 'name' | 'description'): boolean {
        this.validationErrors[field].isValid = true;
        this.validationErrors[field].errorCode = null;

        if (!value || value.trim() === '') {
            this.validationErrors[field].isValid = false;
            this.validationErrors[field].errorCode = ErrorCode.Empty;
        } else if (value.length > maxLength) {
            this.validationErrors[field].isValid = false;
            this.validationErrors[field].errorCode = ErrorCode.TooLong;
        }
        return this.validationErrors[field].isValid;
    }

    private validateItemCount(
        map: MapData,
        itemType: ItemType,
        requiredCount: number,
        errorContainer: { isValid: boolean; errorCode: ErrorCode | null },
    ): boolean {
        const placedCount = map.items[itemType]?.length || 0;

        errorContainer.isValid = placedCount === requiredCount;

        if (!errorContainer.isValid) {
            errorContainer.errorCode = placedCount > requiredCount ? ErrorCode.TooManyItems : ErrorCode.MissingRequiredItems;
        } else {
            errorContainer.errorCode = null;
        }

        return errorContainer.isValid;
    }

    private handleTile(position: Position, map: MapData): void {
        const tileType = map.tiles[position.x][position.y];
        this.tilesCount.nbTilesTotal++;

        if (tileType === TileType.Water) {
            this.tilesCount.nbWater++;
        } else if (BRIDGE_TYPES.has(tileType)) {
            this.validateBridge(position, map);
            this.tilesCount.nbBridge++;
        } else if (tileType === TileType.Grass || tileType === TileType.Path || tileType === TileType.Bush) {
            this.tilesCount.nbTerrain++;
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

    private isOnMapEdge(position: Position, map: MapData): boolean {
        return position.x === 0 || position.x === map.tiles.length - 1 || position.y === 0 || position.y === map.tiles.length - 1;
    }

    private isCorrectlyPlacedBridge(position: Position, map: MapData): boolean {
        const x = position.x;
        const y = position.y;

        const hasWaterAboveAndBelow = map.tiles[x]?.[y - 1] === TileType.Water && map.tiles[x]?.[y + 1] === TileType.Water;
        const hasTraversableSides = this.canTraverseTile(map.tiles[x - 1]?.[y], false) && this.canTraverseTile(map.tiles[x + 1]?.[y], false);
        const isBetweenHorizontalWater = hasWaterAboveAndBelow && hasTraversableSides;

        const hasWaterLeftAndRight = map.tiles[x - 1]?.[y] === TileType.Water && map.tiles[x + 1]?.[y] === TileType.Water;
        const hasTraversableAboveBelow = this.canTraverseTile(map.tiles[x]?.[y - 1], false) && this.canTraverseTile(map.tiles[x]?.[y + 1], false);
        const isBetweenVerticalWater = hasWaterLeftAndRight && hasTraversableAboveBelow;

        return isBetweenHorizontalWater || isBetweenVerticalWater;
    }

    private canTraverseTile(tileType: TileType, isBridgeTraversable: boolean): boolean {
        if (isBridgeTraversable) {
            return tileType !== TileType.Water;
        } else {
            return tileType !== TileType.Water && !BRIDGE_TYPES.has(tileType);
        }
    }
}
