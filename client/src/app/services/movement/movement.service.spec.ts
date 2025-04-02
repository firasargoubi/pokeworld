import { TestBed } from '@angular/core/testing';
import { MatchData } from '@common/interfaces/match-data';
import { NeighborContext } from '@common/interfaces/movement';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MovementService } from './movement.service';

describe('MovementService', () => {
    let service: MovementService;
    let mockMatchData: MatchData;
    let size: number;

    beforeEach(() => {
        mockMatchData = structuredClone(MOCK_MATCH_DATAS[0]);
        mockMatchData.players = [{ position: { x: 1, y: 1 } }, { position: { x: 2, y: 2 } }];
        mockMatchData.playData.activePlayerIndex = 0;
        mockMatchData.playData.movementLeft = 2;
        mockMatchData.gameData.mapData.size = 3;
        mockMatchData.gameData.mapData.tiles = [
            [TileType.Grass, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.Water, TileType.Grass],
        ];
        mockMatchData.gameData.mapData.items.Item1 = [{ x: 0, y: 0 }];
        size = mockMatchData.size;

        TestBed.configureTestingModule({
            providers: [MovementService],
        });
        service = TestBed.inject(MovementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('get possible moves should return valid moves within range', () => {
        const moves = service.getPossibleMoves(mockMatchData);
        expect(moves).toBeDefined();
        expect(moves.every((p) => p.x >= 0 && p.x < size && p.y >= 0 && p.y < size)).toBeTrue();
    });

    it('get shortest path should return shortest path to target', () => {
        const target = { x: 2, y: 1 };
        const result = service.getShortestPath(mockMatchData, target);
        expect(result).toEqual(jasmine.objectContaining({ moveCost: jasmine.any(Number), path: jasmine.any(Array) }));
    });

    it('get actions should return adjacent tiles with players or bridges', () => {
        const actions = service.getActions(mockMatchData);
        expect(actions).toBeDefined();
        expect(actions.length).toBeGreaterThan(0);
    });

    it('get possible moves debug should return all accessible empty tiles', () => {
        const moves = service.getPossibleMovesDebug(mockMatchData);
        expect(moves).toBeDefined();
        expect(moves.every((p) => p.x >= 0 && p.x < size && p.y >= 0 && p.y < size)).toBeTrue();
    });

    it('get nearest empty tile should return nearest valid tile', () => {
        const currentPos: Position = { x: 1, y: 1 };
        const result = service.getNearestEmptyTile(mockMatchData, currentPos);
        expect(result).toEqual(jasmine.objectContaining({ x: jasmine.any(Number), y: jasmine.any(Number) }));
    });

    it('is tile valid for movement should check if tile is accessible and not occupied', () => {
        const position: Position = { x: 0, y: 1 };
        const isValid = service['isTileValidForMovement'](mockMatchData, position);
        expect(isValid).toBeTrue();
    });

    it('enqueue valid neighbors should add valid neighbors to queue', () => {
        const position: Position = { x: 1, y: 1 };
        const visitedQueue = {
            visited: Array(size)
                .fill(null)
                .map(() => Array(size).fill(false)),
            queue: [] as Position[],
        };
        service['enqueueValidNeighbors'](mockMatchData, position, visitedQueue);
        expect(visitedQueue.queue.length).toBeGreaterThan(0);
    });

    it('is tile a bridge should detect bridge tiles', () => {
        const position: Position = { x: 1, y: 1 }; // Grass tile in mock data
        const isBridge = service['isTileABridge'](mockMatchData, position);
        expect(isBridge).toBeFalse();
    });

    it('get possible moves standard should return moves within range', () => {
        const currentPos: Position = { x: 1, y: 1 };
        const moves = service['getPossibleMovesStandard'](mockMatchData, currentPos, 2);
        expect(moves).toBeDefined();
        expect(moves.length).toBeGreaterThan(0);
    });

    it('process neighbor should update distances and predecessors', () => {
        const context: NeighborContext = {
            pos: { x: 1, y: 1 },
            cost: 0,
            offset: { x: 1, y: 0 },
            maxCost: 2,
            size,
            matchData: mockMatchData,
            distances: Array(size)
                .fill(null)
                .map(() => Array(size).fill(Infinity)),
            predecessors: new Map<Position, Position>(),
            queue: [],
        };
        service['processNeighbor'](context);
        expect(context.distances[2][1]).not.toBe(Infinity);
    });

    it('calculate distances and predecessors should compute distances and predecessors', () => {
        const startPos: Position = { x: 1, y: 1 };
        const result = service['calculateDistancesAndPredecessors'](mockMatchData, startPos, 2);
        expect(result.distances[1][1]).toBe(0);
        expect(result.predecessors).toBeInstanceOf(Map);
    });

    it('reconstruct path should build path from predecessors', () => {
        const target: Position = { x: 2, y: 1 };
        const predecessors = new Map<Position, Position>([
            [
                { x: 2, y: 1 },
                { x: 1, y: 1 },
            ],
            [
                { x: 1, y: 1 },
                { x: 0, y: 1 },
            ],
        ]);
        const path = service['reconstructPath'](target, predecessors);
        expect(path).toContain(jasmine.objectContaining({ x: 2, y: 1 }));
    });

    it('is tile occupied by player should detect player presence', () => {
        const position: Position = { x: 1, y: 1 };
        const isOccupied = service['isTileOccupiedByPlayer'](mockMatchData, position);
        expect(isOccupied).toBeTrue();
    });

    it('is tile occupied by object should detect item presence', () => {
        const position: Position = { x: 0, y: 0 };
        const isOccupied = service['isTileOccupiedByObject'](mockMatchData, position);
        expect(isOccupied).toBeTrue();
    });

    it('is out of bounds should check map boundaries', () => {
        const position: Position = { x: 3, y: 3 };
        const isOut = service['isOutOfBounds'](mockMatchData, position);
        expect(isOut).toBeTrue();
    });

    it('get movement cost should return tile cost', () => {
        const position: Position = { x: 0, y: 1 };
        const cost = service['getMovementCost'](mockMatchData, position);
        expect(cost).toBeDefined();
    });

    it('is tile accessible should check tile accessibility', () => {
        const position: Position = { x: 0, y: 1 };
        const isAccessible = service['isTileAccessible'](mockMatchData, position);
        expect(isAccessible).toBeTrue();
    });

    it('p to key should convert position to string key', () => {
        const position: Position = { x: 1, y: 2 };
        const key = service['posToKey'](position);
        expect(key).toBe('1-2');
    });

    it('key to p should convert string key to position', () => {
        const key = '1-2';
        const position = service['keyToPos'](key);
        expect(position).toEqual({ x: 1, y: 2 });
    });
});
