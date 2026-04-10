/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Structure } from '@app/interfaces/map-structures';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MapPositionUtilsService } from './map-position-utils.service';

describe('MapPositionUtilsService', () => {
    let service: MapPositionUtilsService;
    let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
    let movementServiceSpy: jasmine.SpyObj<MovementService>;

    beforeEach(() => {
        const gameDataSpy = jasmine.createSpyObj('GameDataService', ['isOutOfBound', 'getTile']);
        const movementSpy = jasmine.createSpyObj('MovementService', ['posToKey', 'keyToPos']);

        TestBed.configureTestingModule({
            providers: [
                MapPositionUtilsService,
                { provide: GameDataService, useValue: gameDataSpy },
                { provide: MovementService, useValue: movementSpy },
            ],
        });

        service = TestBed.inject(MapPositionUtilsService);
        gameDataServiceSpy = TestBed.inject(GameDataService) as jasmine.SpyObj<GameDataService>;
        movementServiceSpy = TestBed.inject(MovementService) as jasmine.SpyObj<MovementService>;
    });

    describe('positionToKey', () => {
        it('should delegate to movementService.posToKey', () => {
            const pos: Position = { x: 1, y: 2 };
            const expectedKey = '1-2';
            movementServiceSpy.posToKey.and.returnValue(expectedKey);

            const result = service.positionToKey(pos);

            expect(movementServiceSpy.posToKey).toHaveBeenCalledWith(pos);
            expect(result).toBe(expectedKey);
        });
    });

    describe('keyToPosition', () => {
        it('should delegate to movementService.keyToPos', () => {
            const key = '1-2';
            const expectedPos: Position = { x: 1, y: 2 };
            movementServiceSpy.keyToPos.and.returnValue(expectedPos);

            const result = service.keyToPosition(key);

            expect(movementServiceSpy.keyToPos).toHaveBeenCalledWith(key);
            expect(result).toBe(expectedPos);
        });
    });

    describe('getManhattanDistance', () => {
        it('should calculate Manhattan distance correctly', () => {
            const pos1: Position = { x: 0, y: 0 };
            const pos2: Position = { x: 3, y: 4 };

            const result = service.getManhattanDistance(pos1, pos2);

            const expected = 7;
            expect(result).toBe(expected);
        });

        it('should return 0 for same position', () => {
            const pos: Position = { x: 5, y: 5 };

            const result = service.getManhattanDistance(pos, pos);

            expect(result).toBe(0);
        });
    });

    describe('getEuclideanDistance', () => {
        it('should calculate Euclidean distance correctly', () => {
            const pos1: Position = { x: 0, y: 0 };
            const pos2: Position = { x: 3, y: 4 };

            const result = service.getEuclideanDistance(pos1, pos2);

            const expected = 5;
            expect(result).toBe(expected);
        });

        it('should return 0 for same position', () => {
            const pos: Position = { x: 2, y: 3 };

            const result = service.getEuclideanDistance(pos, pos);

            expect(result).toBe(0);
        });
    });

    describe('isInBounds', () => {
        it('should return true if not out of bounds', () => {
            const x = 1;
            const y = 1;
            const gridSize = 3;
            gameDataServiceSpy.isOutOfBound.and.returnValue(false);

            const result = service.isInBounds(x, y, gridSize);

            expect(gameDataServiceSpy.isOutOfBound).toHaveBeenCalled();
            expect(result).toBeTrue();
        });

        it('should return false if out of bounds', () => {
            const x = 3;
            const y = 3;
            const gridSize = 3;
            gameDataServiceSpy.isOutOfBound.and.returnValue(true);

            const result = service.isInBounds(x, y, gridSize);

            expect(result).toBeFalse();
        });
    });

    describe('isPositionInStructureInterior', () => {
        it('should return true if position is in structure interior', () => {
            const x = 1;
            const y = 1;
            const structures: Structure[] = [{ interior: [{ x: 1, y: 1 }], border: [] }];

            const result = service.isPositionInStructureInterior(x, y, structures);

            expect(result).toBeTrue();
        });

        it('should return false if position is not in structure interior', () => {
            const x = 2;
            const y = 2;
            const structures: Structure[] = [{ interior: [{ x: 1, y: 1 }], border: [] }];

            const result = service.isPositionInStructureInterior(x, y, structures);

            expect(result).toBeFalse();
        });
    });

    describe('isPositionInStructure', () => {
        it('should return true if position is in structure interior', () => {
            const x = 1;
            const y = 1;
            const structures: Structure[] = [{ interior: [{ x: 1, y: 1 }], border: [] }];

            const result = service.isPositionInStructure(x, y, structures);

            expect(result).toBeTrue();
        });

        it('should return true if position is in structure border', () => {
            const x = 2;
            const y = 2;
            const structures: Structure[] = [{ interior: [], border: [{ x: 2, y: 2 }] }];

            const result = service.isPositionInStructure(x, y, structures);

            expect(result).toBeTrue();
        });

        it('should return false if position is not in structure', () => {
            const x = 3;
            const y = 3;
            const structures: Structure[] = [{ interior: [{ x: 1, y: 1 }], border: [{ x: 2, y: 2 }] }];

            const result = service.isPositionInStructure(x, y, structures);

            expect(result).toBeFalse();
        });
    });

    describe('isValidTerrainTile', () => {
        it('should return false if out of bounds', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const x = 1;
            const y = 1;
            gameDataServiceSpy.isOutOfBound.and.returnValue(true);

            const result = service.isValidTerrainTile(tiles, x, y);

            expect(result).toBeFalse();
        });

        it('should return false if tile is not valid terrain', () => {
            const tiles: TileType[][] = [[TileType.Water]];
            const x = 0;
            const y = 0;
            gameDataServiceSpy.isOutOfBound.and.returnValue(false);
            gameDataServiceSpy.getTile.and.returnValue(TileType.Water);

            const result = service.isValidTerrainTile(tiles, x, y);

            expect(result).toBeFalse();
        });

        it('should return false if in structure', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const x = 0;
            const y = 0;
            const structures: Structure[] = [{ interior: [{ x: 0, y: 0 }], border: [] }];
            gameDataServiceSpy.isOutOfBound.and.returnValue(false);
            gameDataServiceSpy.getTile.and.returnValue(TileType.Grass);

            const result = service.isValidTerrainTile(tiles, x, y, structures);

            expect(result).toBeFalse();
        });

        it('should return true for valid grass tile not in structure', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const x = 0;
            const y = 0;
            gameDataServiceSpy.isOutOfBound.and.returnValue(false);
            gameDataServiceSpy.getTile.and.returnValue(TileType.Grass);

            const result = service.isValidTerrainTile(tiles, x, y);

            expect(result).toBeTrue();
        });
    });

    describe('isGrassTile', () => {
        it('should return false if out of bounds', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const x = 1;
            const y = 1;
            gameDataServiceSpy.isOutOfBound.and.returnValue(true);

            const result = service.isGrassTile(tiles, x, y);

            expect(result).toBeFalse();
        });

        it('should return true if tile is grass', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const x = 0;
            const y = 0;
            gameDataServiceSpy.isOutOfBound.and.returnValue(false);
            gameDataServiceSpy.getTile.and.returnValue(TileType.Grass);

            const result = service.isGrassTile(tiles, x, y);

            expect(result).toBeTrue();
        });

        it('should return false if tile is not grass', () => {
            const tiles: TileType[][] = [[TileType.Water]];
            const x = 0;
            const y = 0;
            gameDataServiceSpy.isOutOfBound.and.returnValue(false);
            gameDataServiceSpy.getTile.and.returnValue(TileType.Water);

            const result = service.isGrassTile(tiles, x, y);

            expect(result).toBeFalse();
        });
    });

    describe('getAdjacentCardinalPositions', () => {
        it('should return adjacent cardinal positions within bounds', () => {
            const x = 1;
            const y = 1;
            const gridSize = 3;
            spyOn(service, 'isInBounds').and.returnValue(true);

            const result = service.getAdjacentCardinalPositions(x, y, gridSize);

            const expected = 4;
            expect(result.length).toBe(expected);
            expect(result).toContain({ x: 0, y: 1 });
            expect(result).toContain({ x: 2, y: 1 });
            expect(result).toContain({ x: 1, y: 0 });
            expect(result).toContain({ x: 1, y: 2 });
        });

        it('should filter out out of bounds positions', () => {
            const x = 0;
            const y = 0;
            const gridSize = 3;
            spyOn(service, 'isInBounds').and.callFake((px, py) => px >= 0 && py >= 0 && px < gridSize && py < gridSize);

            const result = service.getAdjacentCardinalPositions(x, y, gridSize);

            expect(result.length).toBe(2);
            expect(result).toContain({ x: 1, y: 0 });
            expect(result).toContain({ x: 0, y: 1 });
        });
    });

    describe('getAdjacentPositions', () => {
        it('should return adjacent positions within bounds', () => {
            const x = 1;
            const y = 1;
            const gridSize = 3;
            spyOn(service, 'isInBounds').and.returnValue(true);

            const result = service.getAdjacentPositions(x, y, gridSize);

            const expected = 8;
            expect(result.length).toBe(expected);
        });

        it('should filter out out of bounds positions', () => {
            const x = 0;
            const y = 0;
            const gridSize = 3;
            spyOn(service, 'isInBounds').and.callFake((px, py) => px >= 0 && py >= 0 && px < gridSize && py < gridSize);

            const result = service.getAdjacentPositions(x, y, gridSize);

            const expected = 3;
            expect(result.length).toBe(expected);
        });
    });

    describe('findRandomUnplacedPosition', () => {
        it('should return a random available position', () => {
            const candidates: Position[] = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ];
            const placedPositions = new Set<string>(['0-0']);
            movementServiceSpy.posToKey.and.callFake((pos) => `${pos.x}-${pos.y}`);

            const result = service.findRandomUnplacedPosition(candidates, placedPositions);

            expect(result).toEqual({ x: 1, y: 1 });
        });

        it('should return null if no available positions', () => {
            const candidates: Position[] = [{ x: 0, y: 0 }];
            const placedPositions = new Set<string>(['0-0']);
            movementServiceSpy.posToKey.and.returnValue('0-0');

            const result = service.findRandomUnplacedPosition(candidates, placedPositions);

            expect(result).toBeNull();
        });
    });

    describe('hasMinimumDistance', () => {
        it('should return true if distance is greater than min', () => {
            const pos: Position = { x: 0, y: 0 };
            const existing: Position[] = [{ x: 3, y: 3 }];
            const minDistance = 5;

            const result = service.hasMinimumDistance(pos, existing, minDistance);

            expect(result).toBeTrue();
        });

        it('should return false if distance is less than or equal to min', () => {
            const pos: Position = { x: 0, y: 0 };
            const existing: Position[] = [{ x: 1, y: 1 }];
            const minDistance = 2;

            const result = service.hasMinimumDistance(pos, existing, minDistance);

            expect(result).toBeFalse();
        });
    });
});
