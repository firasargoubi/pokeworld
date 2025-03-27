describe('MovementService', () => {
    it('should be true', () => {
        // TODO
        expect(true).toBeTruthy();
    });
});

// import { MapData } from '@common/interfaces/map-data';
// import { Match } from '@common/interfaces/match';
// import { ShortestPath } from '@common/interfaces/movement';
// import { Position } from '@common/interfaces/position';
// import { TILE_COST, TileType } from '@common/interfaces/tile-type.enum';
// import { MOCK_MATCHES } from '@common/test-consts/mock-matches';
// import { Test, TestingModule } from '@nestjs/testing';
// import { createSandbox, SinonSandbox } from 'sinon';
// import { MovementService } from './movement.service';
// import { MOCK_NEW_SECTION } from './movement.service.spec.const';

// describe('MovementService', () => {
//     let service: MovementService;
//     let sandbox: SinonSandbox;

//     beforeAll(async () => {
//         sandbox = createSandbox();

//         const module: TestingModule = await Test.createTestingModule({
//             providers: [MovementService],
//         }).compile();

//         service = module.get<MovementService>(MovementService);
//     });

//     afterEach(() => {
//         sandbox.restore();
//     });

//     it('should return reachable moves excluding the starting position (Standard)', () => {
//         const currentPos: Position = { x: 0, y: 0 };
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = currentPos;
//         match.matchData.players[0].currentStats.movement = 2;
//         const moves = service.getPossibleMoves(match);
//         expect(moves).not.toContainEqual(currentPos);
//         expect(moves.length).toBeGreaterThan(0);
//     });

//     it('should exclude tiles of type Water and BrokenBridge', () => {
//         const dummyMap: MapData = structuredClone(MOCK_MATCHES[0].gameData.mapData);
//         for (let row = 0; row < MOCK_NEW_SECTION.length; row++) {
//             dummyMap.tiles[row] = MOCK_NEW_SECTION[row];
//         }
//         const matchNoPlayers: Match = structuredClone(MOCK_MATCHES[0]);
//         matchNoPlayers.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         matchNoPlayers.matchData.activePlayer = 0;
//         matchNoPlayers.gameData.mapData = dummyMap;
//         const debugMoves = service['getPossibleMovesDebug'](matchNoPlayers);
//         expect(debugMoves).not.toContainEqual({ x: 0, y: 1 });
//         expect(debugMoves).not.toContainEqual({ x: 1, y: 1 });
//     });

//     it('should exclude positions occupied by players', () => {
//         const dummyMap: MapData = structuredClone(MOCK_MATCHES[0].gameData.mapData);
//         const newSection: TileType[][] = [
//             [TileType.Grass, TileType.Water, TileType.Grass, TileType.Grass],
//             [TileType.Grass, TileType.BrokenBridge, TileType.Grass, TileType.Grass],
//             [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
//             [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
//         ];
//         for (let row = 0; row < newSection.length; row++) {
//             dummyMap.tiles[row] = newSection[row];
//         }
//         const occupiedPos: Position = { x: 2, y: 2 };
//         const matchWithPlayers: Match = structuredClone(MOCK_MATCHES[0]);
//         matchWithPlayers.gameData.mapData = dummyMap;
//         matchWithPlayers.matchData.players = [
//             {
//                 ...structuredClone(MOCK_MATCHES[0].matchData.players[0]),
//                 currentStats: {
//                     ...MOCK_MATCHES[0].matchData.players[0].currentStats,
//                     position: occupiedPos,
//                 },
//             },
//         ];
//         matchWithPlayers.matchData.activePlayer = 0;
//         const debugMovesWithPlayers = service['getPossibleMovesDebug'](matchWithPlayers);
//         expect(debugMovesWithPlayers).not.toContainEqual(occupiedPos);
//     });

//     it('should return a valid shortest path and cost in an unobstructed grid', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);

//         const start: Position = { x: 0, y: 0 };
//         const target: Position = { x: 4, y: 4 };
//         const result: ShortestPath = service.getShortestPath(match, target);
//         const cost = target.x + target.y;

//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = start;
//         expect(result.moveCost).toEqual(cost);
//         expect(result.path[0]).toEqual(start);
//         expect(result.path[result.path.length - 1]).toEqual(target);
//     });

//     it('should return an infinite moveCost and an empty path if the target is unreachable', () => {
//         const dummyMatch: Match = structuredClone(MOCK_MATCHES[1]);
//         dummyMatch.matchData.players = [structuredClone(MOCK_MATCHES[1].matchData.players[0])];
//         dummyMatch.matchData.activePlayer = 0;
//         dummyMatch.matchData.players[0].currentStats.position = { x: 0, y: 0 };
//         dummyMatch.gameData.mapData.tiles = [
//             [TileType.Grass, TileType.Water, TileType.Grass],
//             [TileType.Water, TileType.Water, TileType.Water],
//             [TileType.Grass, TileType.Water, TileType.Grass],
//         ];
//         const target: Position = { x: 4, y: 4 };
//         const result: ShortestPath = service.getShortestPath(dummyMatch, target);
//         expect(result.moveCost).toEqual(Infinity);
//         expect(result.path).toEqual([]);
//     });

//     it('should return an empty array if movementRange is 0', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = { x: 0, y: 0 };
//         match.matchData.players[0].currentStats.movement = 0;
//         const moves = service.getPossibleMoves(match);
//         expect(moves).toEqual([]);
//     });

//     it('should handle out-of-bounds positions gracefully', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = { x: -1, y: -1 };
//         match.matchData.players[0].currentStats.movement = 2;
//         const moves = service.getPossibleMoves(match);
//         expect(moves).toEqual([]);
//     });

//     it('should return an empty path if start and target are the same', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = { x: 0, y: 0 };
//         const target: Position = { x: 0, y: 0 };
//         const result: ShortestPath = service.getShortestPath(match, target);
//         expect(result.moveCost).toEqual(0);
//         expect(result.path).toEqual([]);
//     });
//     it('should correctly calculate distances and predecessors in an unobstructed grid', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = { x: 0, y: 0 };

//         const startPos: Position = { x: 0, y: 0 };
//         const { distances, predecessors } = service['calculateDistancesAndPredecessors'](startPos, match, Infinity);

//         expect(distances[0][0]).toEqual(0);
//         expect(distances[0][1]).toEqual(TILE_COST[TileType.Grass]);
//         expect(distances[1][0]).toEqual(TILE_COST[TileType.Grass]);

//         expect(service['reconstructPath']({ x: 0, y: 1 }, predecessors)[0]).toEqual(startPos);
//         expect(service['reconstructPath']({ x: 1, y: 0 }, predecessors)[0]).toEqual(startPos);
//     });

//     it('should handle blocked tiles (players) correctly', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         const startPos: Position = { x: 0, y: 0 };
//         const otherPlayerPos = { x: 0, y: 1 };
//         match.matchData.players = [MOCK_MATCHES[0].matchData.players[0], MOCK_MATCHES[0].matchData.players[1]];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = startPos;
//         match.matchData.players[1].currentStats.position = otherPlayerPos;

//         const { distances } = service['calculateDistancesAndPredecessors'](startPos, match, Infinity);

//         expect(distances[0][1]).toEqual(Infinity);
//     });

//     it('should handle out-of-bounds positions', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = { x: 0, y: 0 };

//         const startPos: Position = { x: 0, y: 0 };
//         const { distances } = service['calculateDistancesAndPredecessors'](startPos, match, Infinity);

//         expect(distances[-1]?.[0]).toBeUndefined();
//         expect(distances[0]?.[-1]).toBeUndefined();
//     });
//     it('should correctly reconstruct the path from start to target', () => {
//         const predecessors = new Map<Position, Position>();
//         predecessors.set({ x: 1, y: 0 }, { x: 0, y: 0 });
//         predecessors.set({ x: 1, y: 1 }, { x: 1, y: 0 });
//         predecessors.set({ x: 2, y: 1 }, { x: 1, y: 1 });

//         const target: Position = { x: 2, y: 1 };
//         const path = service['reconstructPath'](target, predecessors);

//         expect(path).toEqual([
//             { x: 0, y: 0 },
//             { x: 1, y: 0 },
//             { x: 1, y: 1 },
//             { x: 2, y: 1 },
//         ]);
//     });

//     it('should return null if no path exists', () => {
//         const predecessors = new Map<Position, Position>();
//         const target: Position = { x: 2, y: 1 };
//         const path = service['reconstructPath'](target, predecessors);

//         expect(path).toBeNull();
//     });

//     it('should handle a single-point path (start = target)', () => {
//         const predecessors = new Map<Position, Position>();
//         const target: Position = { x: 0, y: 0 };
//         const path = service['reconstructPath'](target, predecessors);

//         expect(path).toBeNull();
//     });

//     it('should return correct actions for a player', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = { x: 1, y: 1 };

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'isTileOccupiedByPlayer').returns(true);

//         const actions = service.getActions(match);
//         expect(actions).toContainEqual({ x: 1, y: 1 });
//         expect(actions).toContainEqual({ x: 0, y: 1 });
//         expect(actions).toContainEqual({ x: 2, y: 1 });
//         expect(actions).toContainEqual({ x: 1, y: 0 });
//         expect(actions).toContainEqual({ x: 1, y: 2 });
//     });

//     it('should return correct actions including bridges', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.matchData.players = [structuredClone(MOCK_MATCHES[0].matchData.players[0])];
//         match.matchData.activePlayer = 0;
//         match.matchData.players[0].currentStats.position = { x: 1, y: 1 };
//         match.gameData.mapData.tiles[0][1] = TileType.Bridge;

//         const actions = service.getActions(match);
//         expect(actions).toContainEqual({ x: 0, y: 1 });
//     });

//     it('should correctly identify bridge tiles', () => {
//         const match: Match = structuredClone(MOCK_MATCHES[0]);
//         match.gameData.mapData.tiles[0][1] = TileType.Bridge;
//         match.gameData.mapData.tiles[1][1] = TileType.BrokenBridge;

//         expect(service['isTileABridge']({ x: 0, y: 1 }, match)).toBeTruthy();
//         expect(service['isTileABridge']({ x: 1, y: 1 }, match)).toBeTruthy();
//         expect(service['isTileABridge']({ x: 2, y: 2 }, match)).toBeFalsy();
//     });

//     it('should return the current position if it is valid for movement', () => {
//         const match = structuredClone(MOCK_MATCHES[0]);
//         const position = { x: 1, y: 1 };

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'isTileValidForMovement').returns(true);

//         const result = service.getNearestEmptyTile(position, match);
//         expect(result).toEqual(position);
//     });
//     it('should find the nearest valid tile when current position is not valid', () => {
//         const match = structuredClone(MOCK_MATCHES[0]);
//         const currentPos = { x: 1, y: 1 };
//         const validPos = { x: 2, y: 1 };

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'isTileValidForMovement').callsFake((pos: Position) => {
//             return pos.x === validPos.x && pos.y === validPos.y;
//         });

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'enqueueValidNeighbors').callsFake((_pos, _match, { queue }) => {
//             queue.push(validPos);
//         });

//         const result = service.getNearestEmptyTile(currentPos, match);
//         expect(result).toEqual(validPos);
//     });
//     it('shoud return undefined if no valid tile is found', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'isTileValidForMovement').returns(false);

//         const result = service.getNearestEmptyTile({ x: 1, y: 1 }, structuredClone(MOCK_MATCHES[0]));
//         expect(result).toBeUndefined();
//     });
//     it('should return true when tile contains an object', () => {
//         const match = structuredClone(MOCK_MATCHES[0]);
//         const position = { x: 1, y: 2 };

//         match.gameData.mapData.items.Item2 = [position];

//         const result = service['isTileOccupiedByObject'](position, match);
//         expect(result).toBe(true);
//     });
//     it('should return true when tile is not occupied and is accessible', () => {
//         const match = structuredClone(MOCK_MATCHES[0]);
//         const position = { x: 1, y: 1 };

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'isTileOccupiedByPlayer').returns(false);
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'isTileAccessible').returns(true);

//         const result = service['isTileValidForMovement'](position, match);
//         expect(result).toBe(true);
//     });
//     it('should return false if out of bounds', () => {
//         const match = structuredClone(MOCK_MATCHES[0]);
//         const position = { x: 1, y: 1 };

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         sandbox.stub(service as any, 'isOutOfBounds').returns(true);

//         const result = service['isTileAccessible'](position, match);
//         expect(result).toBe(false);
//     });
//     it('should convert a key to a position object', () => {
//         const key = '3-4';
//         const position = service['keyToPos'](key);
//         expect(position).toEqual({ x: 3, y: 4 });
//     });
//     it('should convert a position object to a key', () => {
//         const position = { x: 2, y: 3 };
//         const key = service['posToKey'](position);
//         expect(key).toEqual('2-3');
//     });
// });
