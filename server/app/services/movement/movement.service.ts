import { DistancesAndPredecessors, NeighborContext, QueueNode, VisitedQueue } from '@app/interfaces/movement';
import { SURROUNDING_POSITIONS_PLUS } from '@common/consts/surrounding-positions.const';
import { MapData } from '@common/interfaces/map-data';
import { Match } from '@common/interfaces/match';
import { ShortestPath } from '@common/interfaces/movement';
import { Position } from '@common/interfaces/position';
import { TILE_COST, TileType } from '@common/interfaces/tile-type.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MovementService {
    getPossibleMoves(match: Match): Position[] {
        const activePlayer = match.matchData.players[match.matchData.activePlayer];
        const currentPos = activePlayer.currentStats.position;
        const movementRange = activePlayer.currentStats.movement;
        return match.matchData.isDebugMode ? this.getPossibleMovesDebug(match) : this.getPossibleMovesStandard(currentPos, movementRange, match);
    }

    getShortestPath(match: Match, target: Position): ShortestPath {
        const activePlayer = match.matchData.players[match.matchData.activePlayer];
        const startPos = activePlayer.currentStats.position;

        if (match.matchData.isDebugMode) {
            if (this.isTileAccessible(target, match) && !this.isTileOccupiedByPlayer(target, match) && !this.isTileOccupiedByObject(target, match)) {
                return { moveCost: 0, path: [startPos, target] };
            } else {
                return { moveCost: 0, path: [] };
            }
        }

        const { distances, predecessors } = this.calculateDistancesAndPredecessors(startPos, match, Infinity);
        const path = this.reconstructPath(target, predecessors);
        return { moveCost: distances[target.x][target.y], path: path || [] };
    }

    getActions(match: Match): Position[] {
        const position = match.matchData.players[match.matchData.activePlayer].currentStats.position;
        const neighborActions = SURROUNDING_POSITIONS_PLUS.map((delta) => ({ x: position.x + delta.x, y: position.y + delta.y })).filter(
            (neighbor) => {
                const hasPlayer = this.isTileOccupiedByPlayer(neighbor, match);
                const hasBridge = this.isTileABridge(neighbor, match);
                return hasPlayer || hasBridge;
            },
        );
        return [...neighborActions, position];
    }

    getNearestEmptyTile(currentPos: Position, match: Match): Position {
        const size = match.gameData.mapData.size;
        const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
        const queue: Position[] = [];

        queue.push(currentPos);
        visited[currentPos.x][currentPos.y] = true;

        while (queue.length > 0) {
            const pos = queue.shift();
            if (this.isTileValidForMovement(pos, match)) {
                return pos;
            }
            this.enqueueValidNeighbors(pos, match, { visited, queue });
        }
        return undefined;
    }

    private isTileValidForMovement(position: Position, match: Match): boolean {
        return !this.isTileOccupiedByPlayer(position, match) && this.isTileAccessible(position, match);
    }

    private enqueueValidNeighbors(position: Position, match: Match, visitedQueue: VisitedQueue): void {
        const size = match.gameData.mapData.size;
        for (const offset of SURROUNDING_POSITIONS_PLUS) {
            const neighbor = { x: position.x + offset.x, y: position.y + offset.y };
            if (!this.isOutOfBounds(neighbor, size) && !visitedQueue.visited[neighbor.x][neighbor.y]) {
                visitedQueue.visited[neighbor.x][neighbor.y] = true;
                visitedQueue.queue.push(neighbor);
            }
        }
    }

    private isTileABridge(position: Position, match: Match): boolean {
        let isBridge = false;
        if (!this.isOutOfBounds(position, match.gameData.mapData.size)) {
            const tile = match.gameData.mapData.tiles[position.x][position.y];
            isBridge = tile === TileType.Bridge || tile === TileType.BrokenBridge;
        }
        return isBridge;
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
                const isDifferentPosition = x !== currentPos.x || y !== currentPos.y;
                if (distances[x][y] <= movementRange && isDifferentPosition) {
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
                const position: Position = { x, y };
                if (this.isTileAccessible(position, match)) {
                    tiles.push(position);
                }
            }
        }

        return tiles.filter((pos) => !this.isTileOccupiedByPlayer(pos, match) && !this.isTileOccupiedByObject(pos, match));
    }

    private processNeighbor(context: NeighborContext): void {
        const neighbor: Position = { x: context.pos.x + context.offset.x, y: context.pos.y + context.offset.y };

        if (this.isOutOfBounds(neighbor, context.size) || this.isTileOccupiedByPlayer(neighbor, context.match)) {
            return;
        }

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
            SURROUNDING_POSITIONS_PLUS.forEach((offset) =>
                this.processNeighbor({ pos, cost, offset, maxCost, size, match, distances, predecessors, queue }),
            );
        }
        return { distances, predecessors };
    }

    private reconstructPath(target: Position, predecessors: Map<Position, Position>): Position[] | null {
        const stringPredecessor: Map<string, string> = new Map();

        for (const [key, value] of predecessors.entries()) {
            stringPredecessor.set(this.posToKey(key), this.posToKey(value));
        }

        const path: Position[] = [];
        let currentKey: string = this.posToKey(target);
        while (stringPredecessor.has(currentKey)) {
            path.unshift(this.keyToPos(currentKey));
            currentKey = stringPredecessor.get(currentKey);
        }
        path.unshift(this.keyToPos(currentKey));

        return path.length > 1 ? path : null;
    }

    private isTileOccupiedByPlayer(position: Position, match: Match): boolean {
        return match.matchData.players.some((p) => p.currentStats.position.x === position.x && p.currentStats.position.y === position.y);
    }

    private isTileOccupiedByObject(position: Position, match: Match): boolean {
        for (const items of Object.values(match.gameData.mapData.items)) {
            for (const item of items) {
                if (item.x === position.x && item.y === position.y) {
                    return true;
                }
            }
        }
        return false;
    }

    private isOutOfBounds(position: Position, size: number): boolean {
        const isXOutOfBounds: boolean = position.x < 0 || position.x >= size;
        const isYOutOfBounds: boolean = position.y < 0 || position.y >= size;
        return isXOutOfBounds || isYOutOfBounds;
    }

    private getMovementCost(position: Position, mapData: MapData): number {
        return TILE_COST[mapData.tiles[position.x][position.y]];
    }

    private isTileAccessible(position: Position, match: Match): boolean {
        if (this.isOutOfBounds(position, match.gameData.mapData.size)) {
            return false;
        }
        const tile = match.gameData.mapData.tiles[position.x][position.y];
        return tile !== TileType.Water && tile !== TileType.BrokenBridge;
    }

    private posToKey = (p: Position): string => `${p.x}-${p.y}`;

    private keyToPos = (key: string): Position => {
        const [x, y] = key.split('-').map(Number);
        return { x, y };
    };
}
