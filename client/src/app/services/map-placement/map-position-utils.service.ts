import { Injectable, inject } from '@angular/core';
import { Structure } from '@app/interfaces/map-structures';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MovementService } from '@app/services/movement/movement.service';
import { SURROUNDING_POSITIONS_DONUT, SURROUNDING_POSITIONS_PLUS } from '@common/consts/map-data.const';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';

@Injectable({
    providedIn: 'root',
})
export class MapPositionUtilsService {
    private gameDataService = inject(GameDataService);
    private movementService = inject(MovementService);
    positionToKey(pos: Position): string {
        return this.movementService.posToKey(pos);
    }

    keyToPosition(key: string): Position {
        return this.movementService.keyToPos(key);
    }

    getManhattanDistance(pos1: Position, pos2: Position): number {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    getEuclideanDistance(pos1: Position, pos2: Position): number {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isInBounds(x: number, y: number, gridSize: number): boolean {
        const dummyGrid = Array(gridSize)
            .fill(null)
            .map(() => Array(gridSize).fill(TileType.Grass));
        return !this.gameDataService.isOutOfBound(dummyGrid, { x, y });
    }

    isPositionInStructureInterior(x: number, y: number, structures: Structure[]): boolean {
        return structures.some((structure) => structure.interior.some((p) => p.x === x && p.y === y));
    }

    isPositionInStructure(x: number, y: number, structures: Structure[]): boolean {
        for (const structure of structures) {
            const allPositions = [...structure.interior, ...structure.border];
            if (allPositions.some((p) => p.x === x && p.y === y)) {
                return true;
            }
        }
        return false;
    }

    isValidTerrainTile(tiles: TileType[][], x: number, y: number, structures?: Structure[]): boolean {
        const position = { x, y };

        if (this.gameDataService.isOutOfBound(tiles, position)) {
            return false;
        }

        const tile = this.gameDataService.getTile(tiles, position);
        if (![TileType.Grass, TileType.Path, TileType.Bush].includes(tile)) {
            return false;
        }

        if (structures && this.isPositionInStructure(x, y, structures)) {
            return false;
        }

        return true;
    }

    isGrassTile(tiles: TileType[][], x: number, y: number): boolean {
        const position = { x, y };

        if (this.gameDataService.isOutOfBound(tiles, position)) {
            return false;
        }

        return this.gameDataService.getTile(tiles, position) === TileType.Grass;
    }

    getAdjacentCardinalPositions(x: number, y: number, gridSize: number): Position[] {
        return SURROUNDING_POSITIONS_PLUS.map((dir) => ({ x: x + dir.x, y: y + dir.y })).filter((pos) => this.isInBounds(pos.x, pos.y, gridSize));
    }

    getAdjacentPositions(x: number, y: number, gridSize: number): Position[] {
        return SURROUNDING_POSITIONS_DONUT.map((dir) => ({ x: x + dir.x, y: y + dir.y })).filter((pos) => this.isInBounds(pos.x, pos.y, gridSize));
    }

    findRandomUnplacedPosition(candidates: Position[], placedPositions: Set<string>): Position | null {
        const available = candidates.filter((p) => !placedPositions.has(this.positionToKey(p)));

        if (available.length === 0) {
            return null;
        }

        return available[Math.floor(Math.random() * available.length)];
    }

    hasMinimumDistance(pos: Position, existingPositions: Position[], minDistance: number): boolean {
        for (const existing of existingPositions) {
            if (this.getManhattanDistance(pos, existing) <= minDistance) {
                return false;
            }
        }
        return true;
    }
}
