import { MapData } from '@common/map-data';
import { Match } from '@common/match';
import { Position } from '@common/position';
import { TileCost, TileType } from '@common/tile-type.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MovementService {
    getPossibleMoves(movementRange: number, currentPosition: Position, game: Match, isDebug: boolean = false): Position[] {
        if (isDebug) {
            return this.getPossibleMovesDebug(game);
        }
        return this.getPossibleMovesStandard(movementRange, currentPosition, game);
    }

    getShortestPath(currentPos: Position, targetPos: Position, game: Match): { moveCost: number; path: Position[] } {
        const size = game.gameData.mapData.size;
        const distances: number[][] = Array.from({ length: size }, () => Array(size).fill(Infinity));
        const predecessors: Map<Position, Position> = new Map();
        const queue: { pos: Position; cost: number }[] = [{ pos: currentPos, cost: 0 }];
        distances[currentPos.x][currentPos.y] = 0;

        while (queue.length) {
            queue.sort((a, b) => a.cost - b.cost);
            const next = queue.shift();
            if (!next) break;
            const { pos, cost } = next;

            if (pos.x === targetPos.x && pos.y === targetPos.y) {
                const path: Position[] = [];
                let current: Position | undefined = pos;
                while (current) {
                    path.unshift(current);
                    current = predecessors.get(current);
                }
                return { moveCost: cost, path };
            }

            const neighbors = [
                { x: pos.x - 1, y: pos.y },
                { x: pos.x + 1, y: pos.y },
                { x: pos.x, y: pos.y - 1 },
                { x: pos.x, y: pos.y + 1 },
            ];

            neighbors.forEach((neighbor) => {
                if (neighbor.x < 0 || neighbor.x >= size || neighbor.y < 0 || neighbor.y >= size) return;
                if (this.isTileBlockedByPlayer(neighbor, game)) return;

                const moveCost = this.getMovementCost(neighbor, game.gameData.mapData);
                const newCost = cost + moveCost;

                if (newCost < distances[neighbor.x][neighbor.y]) {
                    distances[neighbor.x][neighbor.y] = newCost;
                    predecessors.set(neighbor, pos);
                    queue.push({ pos: neighbor, cost: newCost });
                }
            });
        }

        return { moveCost: Infinity, path: [] };
    }

    canMove(movementRange: number, currentPos: Position, targetPos: Position, game: Match): boolean {
        const possibleMoves = this.getPossibleMoves(movementRange, currentPos, game);
        return possibleMoves.some((pos) => pos.x === targetPos.x && pos.y === targetPos.y);
    }

    private getPossibleMovesStandard(movementRange: number, currentPosition: Position, game: Match): Position[] {
        const reachableTiles: Position[] = [];
        const size = game.gameData.mapData.size;
        const distances: number[][] = Array.from({ length: size }, () => Array(size).fill(Infinity));
        distances[currentPosition.x][currentPosition.y] = 0;
        const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
        const queue: { pos: Position; cost: number }[] = [{ pos: currentPosition, cost: 0 }];

        while (queue.length) {
            queue.sort((a, b) => a.cost - b.cost);
            const next = queue.shift();
            if (!next) break;
            const { pos, cost } = next;

            if (visited[pos.x][pos.y]) continue;
            visited[pos.x][pos.y] = true;

            if (pos.x !== currentPosition.x || pos.y !== currentPosition.y) {
                reachableTiles.push(pos);
            }

            const neighbors = [
                { x: pos.x - 1, y: pos.y },
                { x: pos.x + 1, y: pos.y },
                { x: pos.x, y: pos.y - 1 },
                { x: pos.x, y: pos.y + 1 },
            ];

            neighbors.forEach((n) => {
                if (n.x < 0 || n.x >= size || n.y < 0 || n.y >= size) return;
                if (this.isTileBlockedByPlayer(n, game)) return;

                const moveCost = this.getMovementCost(n, game.gameData.mapData);
                const newCost = cost + moveCost;

                if (newCost <= movementRange && newCost < distances[n.x][n.y]) {
                    distances[n.x][n.y] = newCost;
                    queue.push({ pos: n, cost: newCost });
                }
            });
        }

        return reachableTiles;
    }

    private getPossibleMovesDebug(game: Match): Position[] {
        let accessibleTiles: Position[] = [];
        const size = game.gameData.mapData.size;

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const tile = game.gameData.mapData.tiles[x][y];
                if (tile === TileType.Water || tile === TileType.BrokenBridge) continue;
                accessibleTiles.push({ x, y });
            }
        }

        const occupiedPositions: Position[] = game.matchData.players.map((player) => ({
            x: player.currentStats.position.x,
            y: player.currentStats.position.y,
        }));

        accessibleTiles = accessibleTiles.filter((tile) => !occupiedPositions.some((occupied) => occupied.x === tile.x && occupied.y === tile.y));

        return accessibleTiles;
    }

    private isTileBlockedByPlayer(position: Position, game: Match): boolean {
        return game.matchData.players.some(
            (player) => player.currentStats.position.x === position.x && player.currentStats.position.y === position.y,
        );
    }

    private getMovementCost(position: Position, mapData: MapData): number {
        const tile = mapData.tiles[position.x][position.y];
        switch (tile) {
            case TileType.Path:
                return TileCost.Path;
            case TileType.Grass:
                return TileCost.Grass;
            case TileType.Bush:
                return TileCost.Bush;
            case TileType.Water:
                return TileCost.Water;
            case TileType.Bridge:
                return TileCost.Bridge;
            case TileType.BrokenBridge:
                return TileCost.BrokenBridge;
            default:
                return TileCost.None;
        }
    }
}
