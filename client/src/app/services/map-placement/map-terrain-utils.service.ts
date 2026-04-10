import { Injectable, inject } from '@angular/core';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MapPositionUtilsService } from './map-position-utils.service';
import { MIN_CONNECTED_TILES } from './map-terrain-utils.const';

@Injectable({
    providedIn: 'root',
})
export class MapTerrainUtilsService {
    private positionUtils = inject(MapPositionUtilsService);

    growTerrainCardinal(grid: TileType[][], startX: number, startY: number, tileType: TileType, maxSize: number, placed: Set<string>): void {
        const gridSize = grid.length;
        let size = 1;

        while (size < maxSize) {
            const adjacentPositions = this.positionUtils.getAdjacentCardinalPositions(startX, startY, gridSize);

            const offset = 0.5;
            const shuffled = adjacentPositions.sort(() => Math.random() - offset);
            let grew = false;

            for (const pos of shuffled) {
                const key = this.positionUtils.positionToKey(pos);

                if (!placed.has(key) && this.isValidPlacementTile(grid, pos.x, pos.y)) {
                    grid[pos.x][pos.y] = tileType;
                    placed.add(key);
                    size++;
                    grew = true;
                    break;
                }
            }

            if (!grew) break;
        }
    }

    growTerrainOrganic(grid: TileType[][], startX: number, startY: number, tileType: TileType, maxSize: number, placed: Set<string>): void {
        const gridSize = grid.length;
        let currentPositions: { x: number; y: number }[] = [{ x: startX, y: startY }];

        while (placed.size < maxSize && currentPositions.length > 0) {
            const nextPositions: { x: number; y: number }[] = [];

            for (const pos of currentPositions) {
                const adjacentPositions = this.positionUtils.getAdjacentPositions(pos.x, pos.y, gridSize);

                for (const adjPos of adjacentPositions) {
                    const key = this.positionUtils.positionToKey(adjPos);

                    if (!placed.has(key) && this.isValidPlacementTile(grid, adjPos.x, adjPos.y)) {
                        grid[adjPos.x][adjPos.y] = tileType;
                        placed.add(key);
                        nextPositions.push(adjPos);

                        if (placed.size >= maxSize) break;
                    }
                }

                if (placed.size >= maxSize) break;
            }

            const selectionProbability = 0.6;
            currentPositions = nextPositions.filter(() => Math.random() < selectionProbability);
        }
    }

    generateTerrainBodies(grid: TileType[][], tileType: TileType, targetTileCount: number, useOrganic: boolean = true): number {
        const placed = new Set<string>();
        let tilesPlaced = 0;

        tilesPlaced = this.generateConnectedTerrainBodies(grid, tileType, targetTileCount, useOrganic, placed);

        tilesPlaced = this.fillRemainingTerrainTiles(grid, tileType, targetTileCount, tilesPlaced, placed);

        return tilesPlaced;
    }

    countTerrainTiles(grid: TileType[][]): number {
        let count = 0;

        for (const tiles of grid) {
            for (const tile of tiles) {
                if (tile === TileType.Grass) {
                    count++;
                }
            }
        }
        return count;
    }

    private generateConnectedTerrainBodies(
        grid: TileType[][],
        tileType: TileType,
        targetTileCount: number,
        useOrganic: boolean,
        placed: Set<string>,
    ): number {
        const gridSize = grid.length;
        let tilesPlaced = 0;
        const minBodySize = Math.min(MIN_CONNECTED_TILES, targetTileCount);

        while (tilesPlaced < targetTileCount) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const key = this.positionUtils.positionToKey({ x, y });

            if (placed.has(key) || !this.isValidPlacementTile(grid, x, y)) {
                continue;
            }

            grid[x][y] = tileType;
            placed.add(key);
            tilesPlaced++;

            const remainingTiles = targetTileCount - tilesPlaced;
            const maxBodySize = Math.min(minBodySize, remainingTiles + 1);

            const beforeGrow = placed.size;
            if (useOrganic) {
                this.growTerrainOrganic(grid, x, y, tileType, maxBodySize, placed);
            } else {
                this.growTerrainCardinal(grid, x, y, tileType, maxBodySize, placed);
            }
            tilesPlaced += placed.size - beforeGrow;
        }

        return tilesPlaced;
    }

    private fillRemainingTerrainTiles(
        grid: TileType[][],
        tileType: TileType,
        targetTileCount: number,
        tilesPlaced: number,
        placed: Set<string>,
    ): number {
        const gridSize = grid.length;
        let placedCount = tilesPlaced;

        while (placedCount < targetTileCount) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const key = this.positionUtils.positionToKey({ x, y });

            if (!placed.has(key) && this.isValidPlacementTile(grid, x, y)) {
                grid[x][y] = tileType;
                placed.add(key);
                placedCount++;
            }
        }

        return placedCount;
    }

    private isValidPlacementTile(grid: TileType[][], x: number, y: number): boolean {
        return this.positionUtils.isGrassTile(grid, x, y);
    }
}
