import { inject, Injectable } from '@angular/core';
import { Structure } from '@app/interfaces/map-structures';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { MapPositionUtilsService } from '@app/services/map-placement/map-position-utils.service';
import { MapTerrainUtilsService } from '@app/services/map-placement/map-terrain-utils.service';
import { GameMode, MapData, MapSize } from '@common/interfaces/map-data';
import { TileType } from '@common/interfaces/tile-type.enum';
import { Position } from '@common/interfaces/position';
import {
    DEFAULT_BUSH_RATIO,
    DEFAULT_PATH_RATIO,
    MAX_RATIO,
    MIN_GRID_OFFSET,
    INTERIOR_SIZE_BASE,
    INTERIOR_SIZE_RANGE,
    LOW_PROBABILITY_THRESHOLD,
    MID_PROBABILITY_THRESHOLD,
    LOW_GROWTH_CANDIDATES_COUNT,
    MID_GROWTH_CANDIDATES_COUNT,
    HIGH_GROWTH_CANDIDATES_COUNT,
} from './map-generator.const';

@Injectable({
    providedIn: 'root',
})
export class MapGeneratorService {
    lastGeneratedMapData: MapData | null = null;
    bushPercentage: number = DEFAULT_BUSH_RATIO;
    pathPercentage: number = DEFAULT_PATH_RATIO;
    private readonly gameValidationService = inject(GameValidationService);
    private readonly positionUtils = inject(MapPositionUtilsService);
    private readonly terrainUtils = inject(MapTerrainUtilsService);

    generateGrid(
        size: MapSize,
        gameMode: GameMode,
        bushPercentage: number = DEFAULT_BUSH_RATIO,
        pathPercentage: number = DEFAULT_PATH_RATIO,
    ): { tiles: TileType[][]; structures: Structure[] } {
        let mapdata: MapData = this.initializeMapData(size, gameMode);
        let structures: Structure[] = [];
        do {
            mapdata = this.initializeMapData(size, gameMode);
            structures = this.generateMapTilesWithStructures(mapdata, bushPercentage, pathPercentage);
        } while (this.areTilesIdentical(mapdata.tiles));

        this.lastGeneratedMapData = structuredClone(mapdata);

        return { tiles: mapdata.tiles, structures };
    }

    isCompleteMapIdentical(current: MapData): boolean {
        const last = this.lastGeneratedMapData;
        if (!last || current.size !== last.size || current.gameMode !== last.gameMode) {
            return false;
        }
        for (let x = 0; x < current.tiles.length; x++) {
            for (let y = 0; y < current.tiles[0].length; y++) {
                if (current.tiles[x][y] !== last.tiles[x][y]) {
                    return false;
                }
            }
        }
        return this.areItemsIdentical(current.items, last.items);
    }
    updateLastGeneratedMapData(mapData: MapData): void {
        this.lastGeneratedMapData = structuredClone(mapData);
    }

    onBushPercentageChange(value: string | number) {
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        this.bushPercentage = Math.max(0, Math.min(MAX_RATIO, numValue));
        if (this.bushPercentage + this.pathPercentage > MAX_RATIO) {
            this.pathPercentage = MAX_RATIO - this.bushPercentage;
        }
    }

    onPathPercentageChange(value: string | number) {
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        this.pathPercentage = Math.max(0, Math.min(MAX_RATIO, numValue));
        if (this.bushPercentage + this.pathPercentage > MAX_RATIO) {
            this.bushPercentage = MAX_RATIO - this.pathPercentage;
        }
    }

    private initializeMapData(size: MapSize, gameMode: GameMode): MapData {
        return {
            tiles: Array(size)
                .fill(null)
                .map(() => Array(size).fill(TileType.Grass)),
            items: {} as Record<string, Position[]>,
            size,
            gameMode,
        };
    }

    private generateMapTilesWithStructures(mapdata: MapData, bushPercentage: number, pathPercentage: number): Structure[] {
        const structures = this.generateStructures(mapdata);
        const remainingTerrainTiles = this.terrainUtils.countTerrainTiles(mapdata.tiles);
        this.generateTerrainFeatures(mapdata.tiles, bushPercentage, pathPercentage, remainingTerrainTiles);
        return structures;
    }

    private areTilesIdentical(current: TileType[][]): boolean {
        const last = this.lastGeneratedMapData;

        if (!last) {
            return false;
        }

        for (let x = 0; x < current.length; x++) {
            for (let y = 0; y < current[0].length; y++) {
                if (current[x][y] !== last.tiles[x][y]) {
                    return false;
                }
            }
        }

        return true;
    }

    private areItemsIdentical(current: Record<string, Position[]>, last: Record<string, Position[]>): boolean {
        const currentKeys = Object.keys(current).sort();
        const lastKeys = Object.keys(last).sort();

        if (currentKeys.length !== lastKeys.length) {
            return false;
        }

        for (let i = 0; i < currentKeys.length; i++) {
            if (currentKeys[i] !== lastKeys[i]) {
                return false;
            }

            const currentItems = current[currentKeys[i]];
            const lastItems = last[lastKeys[i]];

            if (currentItems.length !== lastItems.length) {
                return false;
            }

            const currentPositionsStr = currentItems
                .map((p) => `${p.x}-${p.y}`)
                .sort()
                .join('|');
            const lastPositionsStr = lastItems
                .map((p) => `${p.x}-${p.y}`)
                .sort()
                .join('|');

            if (currentPositionsStr !== lastPositionsStr) {
                return false;
            }
        }

        return true;
    }

    private generateTerrainFeatures(grid: TileType[][], bushPercentage: number, pathPercentage: number, remainingTerrainTiles: number): void {
        let targetPathTiles;
        let targetBushTiles;
        if (bushPercentage >= pathPercentage) {
            targetBushTiles = Math.floor((remainingTerrainTiles * bushPercentage) / MAX_RATIO);
            targetPathTiles = Math.ceil((remainingTerrainTiles * pathPercentage) / MAX_RATIO);
        } else {
            targetPathTiles = Math.floor((remainingTerrainTiles * pathPercentage) / MAX_RATIO);
            targetBushTiles = Math.ceil((remainingTerrainTiles * bushPercentage) / MAX_RATIO);
        }
        if (targetPathTiles > 0) {
            this.terrainUtils.generateTerrainBodies(grid, TileType.Path, targetPathTiles, true);
        }
        if (targetBushTiles > 0) {
            this.terrainUtils.generateTerrainBodies(grid, TileType.Bush, targetBushTiles, true);
        }
    }

    private generateStructures(mapdata: MapData): Structure[] {
        const gridSize = mapdata.size as number;
        const numStructures = this.getNumStructuresForMapSize(mapdata.size);

        const structures: Structure[] = [];

        while (structures.length < numStructures) {
            const structure = this.generateRandomStructure(mapdata, gridSize);
            if (structure && this.isValidStructurePosition(structure, structures)) {
                structures.push(structure);
                this.placeStructure(mapdata, structure);
            }
        }

        return structures;
    }

    private getNumStructuresForMapSize(size: MapSize): number {
        const maxStructuresCount = 3;
        if (size === MapSize.Small) return 1;
        if (size === MapSize.Medium) return 2;
        return maxStructuresCount;
    }

    private generateRandomStructure(mapdata: MapData, gridSize: number): Structure | null {
        const interior = this.createStructureCore(gridSize);
        this.growStructureShape(interior, gridSize, this.getRandomInteriorSize());
        const borderPositions = this.generateStructureBorder(interior, gridSize);

        return {
            interior,
            border: borderPositions,
        };
    }

    private createStructureCore(gridSize: number): Position[] {
        const startX = MIN_GRID_OFFSET + Math.floor(Math.random() * (gridSize - 2 * MIN_GRID_OFFSET));
        const startY = MIN_GRID_OFFSET + Math.floor(Math.random() * (gridSize - 2 * MIN_GRID_OFFSET));

        return [
            { x: startX, y: startY },
            { x: startX + 1, y: startY },
            { x: startX, y: startY + 1 },
            { x: startX + 1, y: startY + 1 },
        ];
    }

    private getRandomInteriorSize(): number {
        return INTERIOR_SIZE_BASE + Math.floor(Math.random() * INTERIOR_SIZE_RANGE);
    }

    private generateStructureBorder(interior: Position[], gridSize: number): Position[] {
        const border: Set<string> = new Set();
        for (const pos of interior) {
            const adjacentPositions = this.positionUtils.getAdjacentPositions(pos.x, pos.y, gridSize);
            for (const adjPos of adjacentPositions) {
                const key = this.positionUtils.positionToKey(adjPos);
                if (!interior.some((p) => p.x === adjPos.x && p.y === adjPos.y)) {
                    border.add(key);
                }
            }
        }

        return Array.from(border).map((key) => this.positionUtils.keyToPosition(key));
    }

    private growStructureShape(interior: Position[], gridSize: number, maxSize: number): void {
        while (interior.length < maxSize) {
            const adjacentCandidates = this.findAdjacentCandidatesForGrowth(interior, gridSize);

            if (adjacentCandidates.length === 0) {
                break;
            }

            this.addRandomCandidatesToInterior(interior, adjacentCandidates, maxSize);
        }
    }

    private findAdjacentCandidatesForGrowth(interior: Position[], gridSize: number): Position[] {
        const adjacentCandidates: Position[] = [];

        for (const pos of interior) {
            const adjacentPositions = this.positionUtils.getAdjacentPositions(pos.x, pos.y, gridSize);

            for (const adjPos of adjacentPositions) {
                if (adjPos.x < 1 || adjPos.x >= gridSize - 1 || adjPos.y < 1 || adjPos.y >= gridSize - 1) {
                    continue;
                }

                if (interior.some((p) => p.x === adjPos.x && p.y === adjPos.y)) {
                    continue;
                }

                if (!adjacentCandidates.some((p) => p.x === adjPos.x && p.y === adjPos.y)) {
                    adjacentCandidates.push(adjPos);
                }
            }
        }

        return adjacentCandidates;
    }

    private addRandomCandidatesToInterior(interior: Position[], adjacentCandidates: Position[], maxSize: number): void {
        const probability = Math.random();
        const numToAdd =
            probability < LOW_PROBABILITY_THRESHOLD
                ? LOW_GROWTH_CANDIDATES_COUNT
                : probability < MID_PROBABILITY_THRESHOLD
                ? MID_GROWTH_CANDIDATES_COUNT
                : HIGH_GROWTH_CANDIDATES_COUNT;

        for (let i = 0; i < numToAdd && adjacentCandidates.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * adjacentCandidates.length);
            const selected = adjacentCandidates[randomIndex];
            interior.push(selected);
            adjacentCandidates.splice(randomIndex, 1);

            if (interior.length >= maxSize) break;
        }
    }

    private isValidStructurePosition(structure: Structure, existingStructures: Structure[]): boolean {
        const allPositions = [...structure.interior, ...structure.border];

        for (const existing of existingStructures) {
            const existingPositions = [...existing.interior, ...existing.border];
            for (const pos of allPositions) {
                if (existingPositions.some((p) => p.x === pos.x && p.y === pos.y)) {
                    return false;
                }
            }
        }

        return true;
    }

    private placeStructure(mapdata: MapData, structure: Structure): void {
        this.placeStructureBorder(mapdata, structure.border);
        this.placeStructureInterior(mapdata, structure.interior);
        this.placeStructureBridges(mapdata, structure.border);
    }

    private placeStructureBorder(mapdata: MapData, borderPositions: Position[]): void {
        for (const pos of borderPositions) {
            if (pos.x >= 0 && pos.x < mapdata.size && pos.y >= 0 && pos.y < mapdata.size) {
                mapdata.tiles[pos.x][pos.y] = TileType.Water;
            }
        }
    }

    private placeStructureInterior(mapdata: MapData, interiorPositions: Position[]): void {
        for (const pos of interiorPositions) {
            if (pos.x >= 0 && pos.x < mapdata.size && pos.y >= 0 && pos.y < mapdata.size) {
                mapdata.tiles[pos.x][pos.y] = TileType.Grass;
            }
        }
    }

    private placeStructureBridges(mapdata: MapData, borderPositions: Position[]): void {
        for (const borderPos of borderPositions) {
            if (this.gameValidationService.validateBridge(borderPos, mapdata) === null) {
                mapdata.tiles[borderPos.x][borderPos.y] = TileType.Bridge;
                break;
            }
        }
    }
}
