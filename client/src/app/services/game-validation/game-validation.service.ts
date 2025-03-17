import { Injectable } from '@angular/core';
import { MAX_ITEM_COUNT } from '@app/consts/items.const';
import { ErrorMessage } from '@app/interfaces/error-message.enum';
import {
    BridgeValidationError,
    ItemsValidation,
    TerrainCoverageValidation,
    TileHandler,
    TilesAccessibilityValidation,
    ValidationResult,
    ValidationStatus,
} from '@app/interfaces/game-validation-result';
import { TilesCount } from '@app/interfaces/tiles-count';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { BRIDGE_TYPES, MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, MIN_TERRAIN_RATIO } from './game-validation.const';

@Injectable({
    providedIn: 'root',
})
export class GameValidationService {
    validateGame(game: GameData): ValidationResult | null {
        const validationResult = this.validateMap(game.mapData);

        validationResult.name = this.validateName(game.name);
        validationResult.description = this.validateDescription(game.description);

        const hasInvalidField = Object.values(validationResult).some((field) => field?.isValid === false);

        return hasInvalidField ? validationResult : null;
    }

    private validateName(gameName: string): ValidationStatus {
        return this.validateField(gameName, MAX_NAME_LENGTH);
    }

    private validateDescription(gameDescription: string): ValidationStatus {
        return this.validateField(gameDescription, MAX_DESCRIPTION_LENGTH);
    }

    private validateField(value: string, maxLength: number): ValidationStatus {
        const validationStatus: ValidationStatus = { isValid: true, errorMessage: null };

        if (!value || !value.trim()) {
            validationStatus.isValid = false;
            validationStatus.errorMessage = ErrorMessage.Empty;
        } else if (value.length > maxLength) {
            validationStatus.isValid = false;
            validationStatus.errorMessage = ErrorMessage.TooLong;
        }
        return validationStatus;
    }

    private validateMap(map: MapData): ValidationResult {
        const bridgeStatus = { isValid: true, errors: [] };
        const tilesCount: TilesCount = {
            nbWater: 0,
            nbBridge: 0,
            nbTerrain: 0,
            nbTilesTotal: 0,
        };

        for (let x = 0; x < map.tiles.length; x++) {
            for (let y = 0; y < map.tiles[x].length; y++) {
                const position: Position = { x, y };
                const tileHandler: TileHandler = { position, map, tilesCount, bridgeStatus };
                this.handleTile(tileHandler);
            }
        }

        const mapValidationResult: ValidationResult = {
            name: { isValid: true, errorMessage: null },
            description: { isValid: true, errorMessage: null },
            terrainCoverage: this.validateTerrainCoverage(tilesCount),
            tilesAccessibility: this.validateTilesAccessibility(map, tilesCount),
            spawnPoint: this.validateSpawnPoints(map),
            items: this.validateItemPlacement(map),
            mode: map.gameMode === GameMode.CTF ? this.validateFlags(map) : { isValid: true, errorMessage: null },
            bridge: bridgeStatus,
        };

        return mapValidationResult;
    }

    private handleTile(tileHandler: TileHandler): void {
        const { position, map, tilesCount, bridgeStatus } = tileHandler;
        const tileType = map.tiles[position.x][position.y];
        tilesCount.nbTilesTotal++;

        if (tileType === TileType.Water) {
            tilesCount.nbWater++;
        } else if (BRIDGE_TYPES.has(tileType)) {
            const result = this.validateBridge(position, map);
            if (result) {
                bridgeStatus.isValid = false;
                bridgeStatus.errors.push(result);
            }
            tilesCount.nbBridge++;
        } else if (tileType === TileType.Grass || tileType === TileType.Path || tileType === TileType.Bush) {
            tilesCount.nbTerrain++;
        }
    }

    private validateBridge(position: Position, map: MapData): BridgeValidationError | null {
        let error: BridgeValidationError | null = null;

        if (this.isOnMapEdge(position, map)) {
            error = { x: position.x, y: position.y, errorMessage: ErrorMessage.BridgeAtEdge };
        } else if (!this.isCorrectlyPlacedBridge(position, map)) {
            error = { x: position.x, y: position.y, errorMessage: ErrorMessage.BridgeNotBetweenWalls };
        }
        return error;
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

    private validateTerrainCoverage(tilesCount: TilesCount): TerrainCoverageValidation {
        const PERCENTAGE_MULTIPLIER = 100;
        const currentTerrainRatio = tilesCount.nbTerrain / tilesCount.nbTilesTotal;

        const terrainCoverageValidation = {
            isValid: currentTerrainRatio > MIN_TERRAIN_RATIO,
            coveragePercentage: parseFloat((currentTerrainRatio * PERCENTAGE_MULTIPLIER).toFixed(2)),
        };

        return terrainCoverageValidation;
    }

    private validateTilesAccessibility(map: MapData, tilesCount: TilesCount): TilesAccessibilityValidation {
        const validationStatus = { isValid: true, nonAccessibleTileCount: 0 };

        const rows = map.tiles.length;
        const cols = map.tiles[0].length;
        const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

        const findStartTile = this.findStartTile(map);

        this.dfs(map, findStartTile, visited);
        const visitedCount = ([] as boolean[]).concat(...visited).reduce((count, tile) => count + (tile ? 1 : 0), 0);

        if (visitedCount < tilesCount.nbTerrain + tilesCount.nbBridge) {
            validationStatus.isValid = false;
            validationStatus.nonAccessibleTileCount = tilesCount.nbBridge + tilesCount.nbTerrain - visitedCount;
        }

        return validationStatus;
    }

    private findStartTile(map: MapData): Position {
        const rows = map.tiles.length;
        const cols = map.tiles[0].length;
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
        return { x: startX, y: startY };
    }

    private dfs(map: MapData, position: Position, visited: boolean[][]): void {
        const { x, y } = position;
        const xOutOfBounds = x < 0 || x >= map.tiles.length;
        const yOutOfBounds = y < 0 || y >= map.tiles[0].length;

        if (xOutOfBounds || yOutOfBounds) {
            return;
        }

        const notTraversable: boolean = visited[x][y] || !this.canTraverseTile(map.tiles[x][y], true);
        if (notTraversable) {
            return;
        }

        visited[x][y] = true;

        this.dfs(map, { x: x + 1, y }, visited);
        this.dfs(map, { x: x - 1, y }, visited);
        this.dfs(map, { x, y: y + 1 }, visited);
        this.dfs(map, { x, y: y - 1 }, visited);
    }

    private canTraverseTile(tileType: TileType, isBridgeTraversable: boolean): boolean {
        if (isBridgeTraversable) {
            return tileType !== TileType.Water;
        } else {
            return tileType !== TileType.Water && !BRIDGE_TYPES.has(tileType);
        }
    }

    private validateItemPlacement(map: MapData): ItemsValidation {
        const validationStatus = { isValid: true, misplacedItems: [] as Position[] };

        for (const [, positions] of Object.entries(map.items)) {
            for (const position of positions) {
                if (!this.canTraverseTile(map.tiles[position.x][position.y], false)) {
                    validationStatus.misplacedItems.push(position);
                }
            }
        }
        validationStatus.isValid = validationStatus.misplacedItems.length === 0;
        return validationStatus;
    }

    private validateSpawnPoints(map: MapData): ValidationStatus {
        const spawnPointCount = MAX_ITEM_COUNT[map.size][ItemType.Spawn];
        return this.validateItemCount(map, ItemType.Spawn, spawnPointCount);
    }

    private validateFlags(map: MapData): ValidationStatus {
        return this.validateItemCount(map, ItemType.Flag, 1);
    }

    private validateItemCount(map: MapData, itemType: ItemType, requiredCount: number): ValidationStatus {
        const validationStatus: ValidationStatus = { isValid: true, errorMessage: null };

        const placedCount = map.items[itemType]?.length || 0;

        validationStatus.isValid = placedCount === requiredCount;
        if (!validationStatus.isValid) {
            validationStatus.errorMessage = placedCount > requiredCount ? ErrorMessage.TooManyItems : ErrorMessage.MissingRequiredItems;
        }

        return validationStatus;
    }
}
