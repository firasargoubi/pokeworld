import { MOCK_MATCHES } from '@app/consts/tests/mock-matches';
import { MapData } from '@common/map-data';
import { Match } from '@common/match';
import { ShortestPath } from '@common/movement';
import { Position } from '@common/position';
import { TILE_COST, TileType } from '@common/tile-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { createSandbox, SinonSandbox } from 'sinon';
import { MovementService } from './movement.service';
import { MOCK_NEW_SECTION } from './movement.service.const';

describe('MovementService', () => {
    let service: MovementService;
    let sandbox: SinonSandbox;

    beforeAll(async () => {
        sandbox = createSandbox();

        const module: TestingModule = await Test.createTestingModule({
            providers: [MovementService],
        }).compile();

        service = module.get<MovementService>(MovementService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return reachable moves excluding the starting position (Standard)', () => {
        const currentPos: Position = { x: 0, y: 0 };
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = currentPos;
        match.matchData.players[0].currentStats.movement = 2;
        const moves = service.getPossibleMoves(match);
        expect(moves).not.toContainEqual(currentPos);
        expect(moves.length).toBeGreaterThan(0);
    });

    it('should exclude tiles of type Water and BrokenBridge', () => {
        const dummyMap: MapData = structuredClone(MOCK_MATCHES[0].gameData.mapData);
        for (let row = 0; row < MOCK_NEW_SECTION.length; row++) {
            dummyMap.tiles[row] = MOCK_NEW_SECTION[row];
        }
        const matchNoPlayers: Match = structuredClone(MOCK_MATCHES[0]);
        matchNoPlayers.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        matchNoPlayers.matchData.activePlayer = 0;
        matchNoPlayers.gameData.mapData = dummyMap;
        const debugMoves = service['getPossibleMovesDebug'](matchNoPlayers);
        expect(debugMoves).not.toContainEqual({ x: 0, y: 1 });
        expect(debugMoves).not.toContainEqual({ x: 1, y: 1 });
    });

    it('should exclude positions occupied by players', () => {
        const dummyMap: MapData = structuredClone(MOCK_MATCHES[0].gameData.mapData);
        const newSection: TileType[][] = [
            [TileType.Grass, TileType.Water, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.BrokenBridge, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
        ];
        for (let row = 0; row < newSection.length; row++) {
            dummyMap.tiles[row] = newSection[row];
        }
        const occupiedPos: Position = { x: 2, y: 2 };
        const matchWithPlayers: Match = structuredClone(MOCK_MATCHES[0]);
        matchWithPlayers.gameData.mapData = dummyMap;
        matchWithPlayers.matchData.players = [
            {
                ...structuredClone(MOCK_MATCHES[0].matchData.players[0]),
                currentStats: {
                    ...MOCK_MATCHES[0].matchData.players[0].currentStats,
                    position: occupiedPos,
                },
            },
        ];
        matchWithPlayers.matchData.activePlayer = 0;
        const debugMovesWithPlayers = service['getPossibleMovesDebug'](matchWithPlayers);
        expect(debugMovesWithPlayers).not.toContainEqual(occupiedPos);
    });

    it('should return a valid shortest path and cost in an unobstructed grid', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);

        const start: Position = { x: 0, y: 0 };
        const target: Position = { x: 4, y: 4 };
        const result: ShortestPath = service.getShortestPath(match, target);
        const cost = target.x + target.y;

        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = start;
        expect(result.moveCost).toEqual(cost);
        expect(result.path[0]).toEqual(start);
        expect(result.path[result.path.length - 1]).toEqual(target);
    });

    it('should return an infinite moveCost and an empty path if the target is unreachable', () => {
        const dummyMatch: Match = structuredClone(MOCK_MATCHES[1]);
        dummyMatch.matchData.players = [structuredClone(MOCK_MATCHES[1].matchData.players[0])];
        dummyMatch.matchData.activePlayer = 0;
        dummyMatch.matchData.players[0].currentStats.position = { x: 0, y: 0 };
        dummyMatch.gameData.mapData.tiles = [
            [TileType.Grass, TileType.Water, TileType.Grass],
            [TileType.Water, TileType.Water, TileType.Water],
            [TileType.Grass, TileType.Water, TileType.Grass],
        ];
        const target: Position = { x: 4, y: 4 };
        const result: ShortestPath = service.getShortestPath(dummyMatch, target);
        expect(result.moveCost).toEqual(Infinity);
        expect(result.path).toEqual([]);
    });

    // Nouveaux tests
    it('should return an empty array if movementRange is 0', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: 0, y: 0 };
        match.matchData.players[0].currentStats.movement = 0;
        const moves = service.getPossibleMoves(match);
        expect(moves).toEqual([]);
    });

    it('should handle out-of-bounds positions gracefully', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: -1, y: -1 }; // Hors limites
        match.matchData.players[0].currentStats.movement = 2;
        const moves = service.getPossibleMoves(match);
        expect(moves).toEqual([]);
    });

    it('should return an empty path if start and target are the same', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: 0, y: 0 };
        const target: Position = { x: 0, y: 0 };
        const result: ShortestPath = service.getShortestPath(match, target);
        expect(result.moveCost).toEqual(0);
        expect(result.path).toEqual([]);
    });
    it('should correctly calculate distances and predecessors in an unobstructed grid', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: 0, y: 0 };

        const startPos: Position = { x: 0, y: 0 };
        const { distances, predecessors } = service['calculateDistancesAndPredecessors'](startPos, match, Infinity);

        // Vérifie les distances
        expect(distances[0][0]).toEqual(0); // Position de départ
        expect(distances[0][1]).toEqual(TILE_COST[TileType.Grass]); // Case adjacente
        expect(distances[1][0]).toEqual(TILE_COST[TileType.Grass]); // Case adjacente

        // Vérifie les prédécesseurs
        expect(service['reconstructPath']({ x: 0, y: 1 }, predecessors)[0]).toEqual(startPos);
        expect(service['reconstructPath']({ x: 1, y: 0 }, predecessors)[0]).toEqual(startPos);
    });

    it('should handle blocked tiles (players) correctly', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        const startPos: Position = { x: 0, y: 0 };
        const otherPlayerPos = { x: 0, y: 1 };
        match.matchData.players = [MOCK_MATCHES[0].matchData.players[0], MOCK_MATCHES[0].matchData.players[1]];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = startPos;
        match.matchData.players[1].currentStats.position = otherPlayerPos;

        const { distances } = service['calculateDistancesAndPredecessors'](startPos, match, Infinity);

        expect(distances[0][1]).toEqual(Infinity);
    });

    it('should handle out-of-bounds positions', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: 0, y: 0 };

        const startPos: Position = { x: 0, y: 0 };
        const { distances } = service['calculateDistancesAndPredecessors'](startPos, match, Infinity);

        // Les cases hors limites ne sont pas accessibles
        expect(distances[-1]?.[0]).toBeUndefined(); // Hors limites
        expect(distances[0]?.[-1]).toBeUndefined(); // Hors limites
    });
    it('should correctly reconstruct the path from start to target', () => {
        const predecessors = new Map<Position, Position>();
        predecessors.set({ x: 1, y: 0 }, { x: 0, y: 0 });
        predecessors.set({ x: 1, y: 1 }, { x: 1, y: 0 });
        predecessors.set({ x: 2, y: 1 }, { x: 1, y: 1 });

        const target: Position = { x: 2, y: 1 };
        const path = service['reconstructPath'](target, predecessors);

        expect(path).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ]);
    });

    it('should return null if no path exists', () => {
        const predecessors = new Map<Position, Position>();
        const target: Position = { x: 2, y: 1 };
        const path = service['reconstructPath'](target, predecessors);

        expect(path).toBeNull();
    });

    it('should handle a single-point path (start = target)', () => {
        const predecessors = new Map<Position, Position>();
        const target: Position = { x: 0, y: 0 };
        const path = service['reconstructPath'](target, predecessors);

        expect(path).toBeNull();
    });
    it('should return accessible moves in Debug mode, excluding Players, Water and BrokenBridge', () => {
        const match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.isDebugMode = true;
        const possibleMoves = [{ x: 4, y: 4 }];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getPossibleMovesDebugStub = sandbox.stub(service as any, 'getPossibleMovesDebug').returns(possibleMoves);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getPossibleMovesStandardStub = sandbox.stub(service as any, 'getPossibleMovesStandard').returns(possibleMoves);

        const result = service['getPossibleMoves'](match);

        expect(result).toEqual(possibleMoves);
        expect(getPossibleMovesStandardStub.notCalled).toBeTruthy();
        expect(getPossibleMovesDebugStub.called).toBeTruthy();
    });

    it('should return correct actions for a player', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: 1, y: 1 };

        const actions = service.getActions(match);
        expect(actions).toContainEqual({ x: 1, y: 1 }); // Current position
        expect(actions).toContainEqual({ x: 0, y: 1 }); // Neighboring position
        expect(actions).toContainEqual({ x: 2, y: 1 }); // Neighboring position
        expect(actions).toContainEqual({ x: 1, y: 0 }); // Neighboring position
        expect(actions).toContainEqual({ x: 1, y: 2 }); // Neighboring position
    });

    it('should return correct actions including bridges', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: 1, y: 1 };
        match.gameData.mapData.tiles[0][1] = TileType.Bridge;

        const actions = service.getActions(match);
        expect(actions).toContainEqual({ x: 0, y: 1 }); // Bridge position
    });

    it('should correctly identify bridge tiles', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.gameData.mapData.tiles[0][1] = TileType.Bridge;
        match.gameData.mapData.tiles[1][1] = TileType.BrokenBridge;

        expect(service['isTileABridge']({ x: 0, y: 1 }, match)).toBeTruthy();
        expect(service['isTileABridge']({ x: 1, y: 1 }, match)).toBeTruthy();
        expect(service['isTileABridge']({ x: 2, y: 2 }, match)).toBeFalsy();
    });

    it('should return a direct path in debug mode', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.isDebugMode = true;
        match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
        match.matchData.activePlayer = 0;
        match.matchData.players[0].currentStats.position = { x: 0, y: 0 };

        const target: Position = { x: 2, y: 2 };
        const result: ShortestPath = service.getShortestPath(match, target);

        expect(result.moveCost).toEqual(0);
        expect(result.path).toEqual([
            { x: 0, y: 0 },
            { x: 2, y: 2 },
        ]);
    });
});
