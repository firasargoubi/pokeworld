import { SURROUNDING_POSITIONS_PLUS } from '@common/consts/map-data.const';
import { MatchData } from '@common/interfaces/match-data';
import { NeighborContext } from '@common/interfaces/movement';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, createSandbox } from 'sinon';
import { MapService } from './map.service';

describe('MapService', () => {
    let service: MapService;
    let sandbox: SinonSandbox;
    let mockMatchData: MatchData;

    beforeAll(async () => {
        sandbox = createSandbox();
        const module: TestingModule = await Test.createTestingModule({
            providers: [MapService],
        }).compile();

        service = module.get<MapService>(MapService);
    });

    beforeEach(() => {
        mockMatchData = structuredClone(MOCK_MATCH_DATAS[0]);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('get possible moves should return possible moves', () => {
        mockMatchData.playData.activePlayerIndex = 0;
        mockMatchData.players[0].position = { x: 0, y: 0 };
        mockMatchData.playData.movementLeft = 2;

        const moves = service.getPossibleMoves(mockMatchData);

        expect(moves.length).toBeGreaterThan(0);
    });

    it('get shortest path should return path and cost', () => {
        mockMatchData.playData.activePlayerIndex = 0;
        mockMatchData.players[0].position = { x: 0, y: 0 };
        const target = { x: 1, y: 1 };

        const result = service.getShortestPath(mockMatchData, target);

        expect(result.moveCost).toBeDefined();
    });

    it('get actions should return actions for bridges', () => {
        mockMatchData.playData.activePlayerIndex = 0;
        mockMatchData.players[0].position = { x: 1, y: 1 };
        mockMatchData.gameData.mapData.tiles[1][2] = TileType.Bridge;

        const actions = service.getActions(mockMatchData);

        expect(actions).toContainEqual({ x: 1, y: 2 });
    });

    it('get possible moves debug should return accessible tiles', () => {
        mockMatchData.gameData.mapData.tiles[0][1] = TileType.Grass;

        const moves = service.getPossibleMovesDebug(mockMatchData);

        expect(moves).toContainEqual({ x: 0, y: 1 });
    });

    it('get nearest empty tile should return nearest tile', () => {
        const currentPos = { x: 0, y: 0 };
        sandbox
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .stub(service as any, 'isTileValidForMovement')
            .onFirstCall()
            .returns(true)
            .onSecondCall()
            .returns(false);

        const result1 = service.getNearestEmptyTile(mockMatchData, currentPos);
        expect(result1).toEqual(currentPos);
        const result2 = service.getNearestEmptyTile(mockMatchData, currentPos);
        expect(result2).toEqual(currentPos);
    });

    it('get nearest empty tile should return position if out of bound', () => {
        const position = { x: -1, y: -1 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isOutOfBounds').returns(true);

        const result = service.getNearestEmptyTile(mockMatchData, position);
        expect(result).toEqual(position);
    });

    it('is tile valid for movement should return true if valid', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isTileOccupiedByPlayer').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isTileAccessible').returns(true);

        const result = service['isTileValidForMovement'](mockMatchData, { x: 0, y: 0 });

        expect(result).toBe(true);
    });

    it('enqueue valid neighbors should enqueue neighbors', () => {
        const size = mockMatchData.gameData.mapData.size;
        const visitedQueue = {
            visited: Array.from({ length: size }, () => Array(size).fill(false)),
            queue: [],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isOutOfBounds').returns(false);

        service['enqueueValidNeighbors'](mockMatchData, { x: 1, y: 1 }, visitedQueue);

        expect(visitedQueue.queue.length).toBe(SURROUNDING_POSITIONS_PLUS.length);
    });

    it('is tile a bridge should return true for bridge', () => {
        mockMatchData.gameData.mapData.tiles[0][0] = TileType.Bridge;

        const result = service['isTileABridge'](mockMatchData, { x: 0, y: 0 });

        expect(result).toBe(true);
    });

    it('get possible moves standard should return moves within range', () => {
        const size = mockMatchData.gameData.mapData.size;
        const distances = Array.from({ length: size }, () => Array(size).fill(Infinity));
        distances[0][0] = 0;
        distances[0][1] = 1;
        distances[1][0] = 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'calculateDistancesAndPredecessors').returns({ distances });

        const moves = service['getPossibleMovesStandard'](mockMatchData, { x: 0, y: 0 }, 1);

        expect(moves).toContainEqual({ x: 0, y: 1 });
    });

    it('get possible moves standard empty if out of bound', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isOutOfBounds').returns(true);

        const result = service['getPossibleMovesStandard'](mockMatchData, { x: 0, y: 0 }, 1);

        expect(result).toEqual([]);
    });

    it('process neighbor should update distances and queue', () => {
        const context: NeighborContext = {
            pos: { x: 0, y: 0 },
            cost: 0,
            offset: { x: 0, y: 1 },
            maxCost: 10,
            matchData: mockMatchData,
            distances: [
                [0, Infinity],
                [Infinity, Infinity],
            ],
            predecessors: new Map(),
            queue: [],
            size: 0,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isOutOfBounds').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isTileOccupiedByPlayer').returns(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'getMovementCost').returns(1);

        service['processNeighbor'](context);

        expect(context.distances[0][1]).toBe(1);
        expect(context.queue.length).toBe(1);
    });

    it('calculate distances and predecessors should calculate distances', () => {
        const result = service['calculateDistancesAndPredecessors'](mockMatchData, { x: 0, y: 0 }, 1);

        expect(result.distances[0][0]).toBe(0);
    });

    it('reconstruct path should return path', () => {
        const predecessors = new Map();
        predecessors.set({ x: 1, y: 0 }, { x: 0, y: 0 });

        const path = service['reconstructPath']({ x: 1, y: 0 }, predecessors);

        expect(path).toContainEqual({ x: 0, y: 0 });
    });

    it('is tile occupied by player should return true if occupied', () => {
        mockMatchData.players[0].position = { x: 0, y: 0 };

        const result = service['isTileOccupiedByPlayer'](mockMatchData, { x: 0, y: 0 });

        expect(result).toBe(true);
    });

    it('is tile occupied by object should return true if occupied', () => {
        mockMatchData.gameData.mapData.items.Spawn = [{ x: 0, y: 0 }];

        const result = service['isTileOccupiedByObject'](mockMatchData, { x: 0, y: 0 });

        expect(result).toBe(true);
    });

    it('is out of bounds should return true if out of bounds', () => {
        const result = service['isOutOfBounds'](mockMatchData, { x: -1, y: 0 });

        expect(result).toBe(true);
    });

    it('get movement cost should return tile cost', () => {
        mockMatchData.gameData.mapData.tiles[0][0] = TileType.Grass;

        const cost = service['getMovementCost'](mockMatchData, { x: 0, y: 0 });

        expect(cost).toBeDefined();
    });

    it('is tile accessible should return true if accessible', () => {
        mockMatchData.gameData.mapData.tiles[0][0] = TileType.Grass;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sandbox.stub(service as any, 'isOutOfBounds').returns(false);

        const result = service['isTileAccessible'](mockMatchData, { x: 0, y: 0 });

        expect(result).toBe(true);
    });

    it('pos to key should convert position to key', () => {
        const key = service['posToKey']({ x: 1, y: 2 });

        expect(key).toBe('1-2');
    });

    it('key to pos should convert key to position', () => {
        const pos = service['keyToPos']('1-2');

        expect(pos).toEqual({ x: 1, y: 2 });
    });
});
