import { MapData } from '@common/map-data';
import { Match } from '@common/match';
import { ShortestPath } from '@common/movement';
import { Position } from '@common/position';
import { TILE_COST, TileType } from '@common/tile-type.enum';
import { Injectable } from '@nestjs/common';
import { DistancesAndPredecessors, keyToPos, NEIGHBOR_OFFSETS, NeighborContext, posToKey, QueueNode } from './movement.service.const';

@Injectable()
export class MovementService {
    getPossibleMoves(match: Match): Position[] {
        const active = match.matchData.players[match.matchData.activePlayer];
        const currentPos = active.currentStats.position;
        const movementRange = active.currentStats.movement;
        return match.matchData.isDebugMode ? this.getPossibleMovesDebug(match) : this.getPossibleMovesStandard(currentPos, movementRange, match);
    }

    getShortestPath(match: Match, target: Position): ShortestPath {
        const active = match.matchData.players[match.matchData.activePlayer];
        const start = active.currentStats.position;
        const { distances, predecessors } = this.calculateDistancesAndPredecessors(start, match, Infinity);
        const path = this.reconstructPath(target, predecessors);
        return { moveCost: distances[target.x][target.y], path: path || [] };
    }

    canMove(match: Match, target: Position): boolean {
        return this.getPossibleMoves(match).some((pos) => pos.x === target.x && pos.y === target.y);
    }

    private getPossibleMovesStandard(currentPos: Position, movementRange: number, match: Match): Position[] {
        if (this.isOutOfBounds(currentPos, match.gameData.mapData.size)) {
            return [];
        }
        const { distances } = this.calculateDistancesAndPredecessors(currentPos, match, movementRange);
        const tiles: Position[] = [];
        const size: number = match.gameData.mapData.size;

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (distances[x][y] <= movementRange && (x !== currentPos.x || y !== currentPos.y)) {
                    tiles.push({ x, y });
                }
            }
        }

        return tiles;
    }

    private getPossibleMovesDebug(match: Match): Position[] {
        const size: number = match.gameData.mapData.size;
        const tiles: Position[] = [];

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const tile: TileType = match.gameData.mapData.tiles[x][y];
                if (tile !== TileType.Water && tile !== TileType.BrokenBridge) {
                    tiles.push({ x, y });
                }
            }
        }

        const occupied: Position[] = match.matchData.players.map((p) => p.currentStats.position);
        return tiles.filter((t) => !occupied.some((o) => o.x === t.x && o.y === t.y));
    }

    private processNeighbor(context: NeighborContext): void {
        const neighbor: Position = { x: context.pos.x + context.offset.x, y: context.pos.y + context.offset.y };
        if (this.isOutOfBounds(neighbor, context.size)) return;
        if (this.isTileBlockedByPlayer(neighbor, context.match)) return;
        const moveCost = this.getMovementCost(neighbor, context.match.gameData.mapData);
        const newCost = context.cost + moveCost;
        if (newCost <= context.maxCost && newCost < context.distances[neighbor.x][neighbor.y]) {
            context.distances[neighbor.x][neighbor.y] = newCost;
            context.predecessors.set(neighbor, context.pos);
            context.queue.push({ pos: neighbor, cost: newCost });
        }
    }

    private calculateDistancesAndPredecessors(startPos: Position, match: Match, maxCost: number): DistancesAndPredecessors {
        const size: number = match.gameData.mapData.size;
        const distances: number[][] = Array.from({ length: size }, () => Array(size).fill(Infinity));
        const predecessors: Map<Position, Position> = new Map();
        const queue: QueueNode[] = [{ pos: startPos, cost: 0 }];
        distances[startPos.x][startPos.y] = 0;

        while (queue.length) {
            const { pos, cost } = queue.shift();
            NEIGHBOR_OFFSETS.forEach((offset) => this.processNeighbor({ pos, cost, offset, maxCost, size, match, distances, predecessors, queue }));
        }
        return { distances, predecessors };
    }

    private reconstructPath(target: Position, predecessors: Map<Position, Position>): Position[] | null {
        const stringPred: Map<string, string> = new Map();
        for (const [key, value] of predecessors.entries()) {
            stringPred.set(posToKey(key), posToKey(value));
        }
        const path: Position[] = [];
        let currentKey: string = posToKey(target);
        while (stringPred.has(currentKey)) {
            path.unshift(keyToPos(currentKey));
            currentKey = stringPred.get(currentKey);
        }
        path.unshift(keyToPos(currentKey));
        return path.length > 1 ? path : null;
    }

    private isTileBlockedByPlayer(position: Position, match: Match): boolean {
        return match.matchData.players.some((p) => p.currentStats.position.x === position.x && p.currentStats.position.y === position.y);
    }

    private isOutOfBounds(position: Position, size: number): boolean {
        return position.x < 0 || position.x >= size || position.y < 0 || position.y >= size;
    }

    private getMovementCost(position: Position, mapData: MapData): number {
        return TILE_COST[mapData.tiles[position.x][position.y]];
    }
}
