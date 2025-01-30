import { ErrorCode } from '@app/interfaces/error-code.enum';
import { ValidationErrors } from '@app/interfaces/game-validation-errors';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

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

    validateMap(map: MapData): void {
        for (let x = 0; x < map.tiles.length; x++) {
            for (let y = 0; y < map.tiles[x].length; y++) {
                const position: Position = { x, y };
                this.handelTiles(position, map);
            }
        }
        this.hasValidTerrainCoverage();
        this.areAllTilesAccessible(map);
        this.areSpawnPointsValid(map);
        if (map.gameMode === GameMode.CTF) {
            this.areFlagValid(map);
        }
    }

    validateGame(game: GameData): boolean {
        this.isNameValid(game);
        this.isDescriptionValid(game);
        this.isNameDuplicate(game.name);
        this.validateMap(game.mapData);

        return Object.values(this.validationErrors).every((error) => error.isValid);
    }

    private isNameValid(game: GameData): void {
        const MAX_NAME_LENGTH = 32;
        if (!game.name || game.name.trim() === '') {
            this.validationErrors.name.isValid = false;
            this.validationErrors.name.errorCode = ErrorCode.Empty;
        } else if (game.name.length > MAX_NAME_LENGTH) {
            this.validationErrors.name.isValid = false;
            this.validationErrors.name.errorCode = ErrorCode.TooLong;
        }
    }

    private isDescriptionValid(game: GameData): void {
        const MAX_DESCRIPTION_LENGTH = 350;
        if (!game.description || game.description.trim() === '') {
            this.validationErrors.description.isValid = false;
            this.validationErrors.description.errorCode = ErrorCode.Empty;
        } else if (game.description.length > MAX_DESCRIPTION_LENGTH) {
            this.validationErrors.description.isValid = false;
            this.validationErrors.description.errorCode = ErrorCode.TooLong;
        }
    }

    // TODO : verify in data base if game name exists
    private isNameDuplicate(name: string): boolean {
        return name !== '';
    }

    private hasValidTerrainCoverage(): void {
        const MIN_TERRAIN_RATIO = 0.5;
        const PERCENTAGE_FACTOR = 100;

        const currentTerrainRatio = this.tilesCount.nbTerrain / this.tilesCount.nbTilesTotal;

        this.validationErrors.terrainCoverage = {
            isValid: currentTerrainRatio > MIN_TERRAIN_RATIO,
            coveragePercentage: currentTerrainRatio * PERCENTAGE_FACTOR,
        };
    }

    private areBridgeValid(position: Position, map: MapData): void {
        if (this.isOnMapEdge(position, map)) {
            this.validationErrors.bridge.isValid = false;
            this.validationErrors.bridge.errors.push({ x: position.x, y: position.y, errorCode: ErrorCode.BridgeAtEdge });
        } else if (!this.isCorrectlyPlacedBridge(position, map)) {
            this.validationErrors.bridge.isValid = false;
            this.validationErrors.bridge.errors.push({ x: position.x, y: position.y, errorCode: ErrorCode.BridgeNotBetweenWalls });
        }
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

    private areSpawnPointsValid(map: MapData): void {
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

    private getRequiredSpawnPoints(size: MapSize): number {
        const spawnPoints = {
            [MapSize.Small]: 2,
            [MapSize.Medium]: 4,
            [MapSize.Large]: 6,
        };

        return spawnPoints[size];
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

    private canTraverseTile(tileType: TileType, shouldCountBridge: boolean): boolean {
        if (shouldCountBridge) {
            return tileType !== TileType.Water;
        } else {
            return tileType === TileType.Bush || tileType === TileType.Grass || tileType === TileType.Path;
        }
    }

    private areAllTilesAccessible(map: MapData): void {
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

    private handelTiles(position: Position, map: MapData): void {
        const tileType = map.tiles[position.x][position.y];
        this.tilesCount.nbTilesTotal++;

        if (tileType === TileType.Water) {
            this.tilesCount.nbWater++;
        } else if (this.isBridge(tileType)) {
            this.areBridgeValid(position, map);
            this.tilesCount.nbBridge++;
        } else if (tileType === TileType.Grass || tileType === TileType.Path || tileType === TileType.Bush) {
            this.tilesCount.nbTerrain++;
        }
    }

    private areFlagValid(map: MapData): void {
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
}
