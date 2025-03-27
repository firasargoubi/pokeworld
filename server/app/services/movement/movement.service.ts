import { DistancesAndPredecessors, NeighborContext, QueueNode, ShortestPath, VisitedQueue } from '@common/interfaces/movement';
import { Position } from '@common/interfaces/position';
import { TILE_COST, TileType } from '@common/interfaces/tile-type.enum';
import { SURROUNDING_POSITIONS_PLUS } from '@common/consts/map-data.const';
import { Injectable } from '@nestjs/common';
import { MatchData } from '@common/interfaces/match-data';

@Injectable()
export class MovementService {
    getPossibleMoves(matchData: MatchData): Position[] {
        const activePlayer = matchData.players[matchData.playData.activePlayerIndex];
        const currentPos = activePlayer.position;
        const movementRange = matchData.playData.movementLeft;
        return this.getPossibleMovesStandard(matchData, currentPos, movementRange);
    }

    getShortestPath(matchData: MatchData, target: Position): ShortestPath {
        const activePlayer = matchData.players[matchData.playData.activePlayerIndex];
        const startPos = activePlayer.position;

        const { distances, predecessors } = this.calculateDistancesAndPredecessors(matchData, startPos, Infinity);
        const path = this.reconstructPath(target, predecessors);
        return { moveCost: distances[target.x][target.y], path: path || [] };
    }

    getActions(matchData: MatchData): Position[] {
        const position = matchData.players[matchData.playData.activePlayerIndex].position;
        return SURROUNDING_POSITIONS_PLUS.map((delta) => ({ x: position.x + delta.x, y: position.y + delta.y })).filter((neighbor) => {
            const hasPlayer = this.isTileOccupiedByPlayer(matchData, neighbor);
            const hasBridge = this.isTileABridge(matchData, neighbor);
            return hasPlayer || hasBridge;
        });
    }

    getPossibleMovesDebug(matchData: MatchData): Position[] {
        const size = matchData.gameData.mapData.size;
        const tiles: Position[] = [];

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const position: Position = { x, y };
                if (
                    this.isTileAccessible(matchData, position) &&
                    !this.isTileOccupiedByPlayer(matchData, position) &&
                    !this.isTileOccupiedByObject(matchData, position)
                ) {
                    tiles.push(position);
                }
            }
        }

        return tiles;
    }

    getNearestEmptyTile(matchData: MatchData, currentPos: Position): Position {
        const size = matchData.gameData.mapData.size;
        const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
        const queue: Position[] = [];
        queue.push(currentPos);
        visited[currentPos.x][currentPos.y] = true;
        while (queue.length > 0) {
            const pos = queue.shift() as Position;
            if (this.isTileValidForMovement(matchData, pos)) {
                return pos;
            }
            this.enqueueValidNeighbors(matchData, pos, { visited, queue });
        }
        return currentPos;
    }

    private isTileValidForMovement(matchData: MatchData, position: Position): boolean {
        return !this.isTileOccupiedByPlayer(matchData, position) && this.isTileAccessible(matchData, position);
    }

    private enqueueValidNeighbors(matchData: MatchData, position: Position, visitedQueue: VisitedQueue): void {
        for (const offset of SURROUNDING_POSITIONS_PLUS) {
            const neighbor = { x: position.x + offset.x, y: position.y + offset.y };
            if (!this.isOutOfBounds(matchData, neighbor) && !visitedQueue.visited[neighbor.x][neighbor.y]) {
                visitedQueue.visited[neighbor.x][neighbor.y] = true;
                visitedQueue.queue.push(neighbor);
            }
        }
    }

    private isTileABridge(matchData: MatchData, position: Position): boolean {
        let isBridge = false;
        if (!this.isOutOfBounds(matchData, position)) {
            const tile = matchData.gameData.mapData.tiles[position.x][position.y];
            isBridge = tile === TileType.Bridge || tile === TileType.BrokenBridge;
        }
        return isBridge;
    }

    private getPossibleMovesStandard(matchData: MatchData, currentPos: Position, movementRange: number): Position[] {
        if (this.isOutOfBounds(matchData, currentPos)) {
            return [];
        }
        const { distances } = this.calculateDistancesAndPredecessors(matchData, currentPos, movementRange);
        const tiles: Position[] = [];
        const size: number = matchData.gameData.mapData.size;

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

    private processNeighbor(context: NeighborContext): void {
        const neighbor: Position = { x: context.pos.x + context.offset.x, y: context.pos.y + context.offset.y };

        if (this.isOutOfBounds(context.matchData, neighbor) || this.isTileOccupiedByPlayer(context.matchData, neighbor)) {
            return;
        }

        const moveCost = this.getMovementCost(context.matchData, neighbor);
        const newCost = context.cost + moveCost;

        if (newCost <= context.maxCost && newCost < context.distances[neighbor.x][neighbor.y]) {
            context.distances[neighbor.x][neighbor.y] = newCost;
            context.predecessors.set(neighbor, context.pos);
            context.queue.push({ pos: neighbor, cost: newCost });
        }
    }

    private calculateDistancesAndPredecessors(matchData: MatchData, startPos: Position, maxCost: number): DistancesAndPredecessors {
        const size: number = matchData.gameData.mapData.size;
        const distances: number[][] = Array.from({ length: size }, () => Array(size).fill(Infinity));
        const predecessors: Map<Position, Position> = new Map();
        const queue: QueueNode[] = [{ pos: startPos, cost: 0 }];
        distances[startPos.x][startPos.y] = 0;

        while (queue.length) {
            const { pos, cost } = queue.shift() as QueueNode;
            SURROUNDING_POSITIONS_PLUS.forEach((offset) =>
                this.processNeighbor({ pos, cost, offset, maxCost, size, matchData, distances, predecessors, queue }),
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
            currentKey = stringPredecessor.get(currentKey) as string;
        }
        path.unshift(this.keyToPos(currentKey));

        return path.length > 1 ? path : null;
    }

    private isTileOccupiedByPlayer(matchData: MatchData, position: Position): boolean {
        return matchData.players.some((p) => p.position.x === position.x && p.position.y === position.y);
    }

    private isTileOccupiedByObject(matchData: MatchData, position: Position): boolean {
        let isTileOccupiedByObject = false;
        for (const items of Object.values(matchData.gameData.mapData.items)) {
            for (const item of items) {
                if (item.x === position.x && item.y === position.y) {
                    isTileOccupiedByObject = true;
                }
            }
        }
        return isTileOccupiedByObject;
    }

    private isOutOfBounds(matchData: MatchData, position: Position): boolean {
        const size = matchData.gameData.mapData.size;
        const isXOutOfBounds: boolean = position.x < 0 || position.x >= size;
        const isYOutOfBounds: boolean = position.y < 0 || position.y >= size;
        return isXOutOfBounds || isYOutOfBounds;
    }

    private getMovementCost(matchData: MatchData, position: Position): number {
        return TILE_COST[matchData.gameData.mapData.tiles[position.x][position.y]];
    }

    private isTileAccessible(matchData: MatchData, position: Position): boolean {
        let isTileAccessible = false;
        if (!this.isOutOfBounds(matchData, position)) {
            const tile = matchData.gameData.mapData.tiles[position.x][position.y];
            isTileAccessible = tile !== TileType.Water && tile !== TileType.BrokenBridge;
        }
        return isTileAccessible;
    }

    private posToKey(p: Position): string {
        return `${p.x}-${p.y}`;
    }

    private keyToPos(key: string): Position {
        const [x, y] = key.split('-').map(Number);
        return { x, y };
    }
}
