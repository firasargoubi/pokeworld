import { TestBed } from '@angular/core/testing';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { MapPositionUtilsService } from '@app/services/map-placement/map-position-utils.service';
import { MapTerrainUtilsService } from '@app/services/map-placement/map-terrain-utils.service';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapData, MapSize } from '@common/interfaces/map-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MapGeneratorService } from './map-generator.service';

describe('MapGeneratorService', () => {
    const TERRAIN_TILE_COUNT = 50;
    const MIN_INTERIOR_SIZE = 6;
    const MAX_INTERIOR_SIZE = 13;
    const SMALL_MAP_STRUCTURES = 1;
    const MEDIUM_MAP_STRUCTURES = 2;
    const LARGE_MAP_STRUCTURES = 3;
    const GROWTH_SIZE = 5;
    const SMALL_STRUCTURE_SIZE = 10;
    const ZERO = 0;
    let service: MapGeneratorService;
    let gameValidationService: jasmine.SpyObj<GameValidationService>;
    let positionUtils: jasmine.SpyObj<MapPositionUtilsService>;
    let terrainUtils: jasmine.SpyObj<MapTerrainUtilsService>;

    beforeEach(() => {
        const gameValidationServiceSpy = jasmine.createSpyObj('GameValidationService', ['validateBridge']);
        const positionUtilsSpy = jasmine.createSpyObj('MapPositionUtilsService', ['getAdjacentPositions', 'positionToKey', 'keyToPosition']);
        const terrainUtilsSpy = jasmine.createSpyObj('MapTerrainUtilsService', [
            'countTerrainTiles',
            'generateTerrainBodies',
            'growTerrainOrganic',
            'growTerrainCardinal',
        ]);

        TestBed.configureTestingModule({
            providers: [
                MapGeneratorService,
                { provide: GameValidationService, useValue: gameValidationServiceSpy },
                { provide: MapPositionUtilsService, useValue: positionUtilsSpy },
                { provide: MapTerrainUtilsService, useValue: terrainUtilsSpy },
            ],
        });

        service = TestBed.inject(MapGeneratorService);
        gameValidationService = TestBed.inject(GameValidationService) as jasmine.SpyObj<GameValidationService>;
        positionUtils = TestBed.inject(MapPositionUtilsService) as jasmine.SpyObj<MapPositionUtilsService>;
        terrainUtils = TestBed.inject(MapTerrainUtilsService) as jasmine.SpyObj<MapTerrainUtilsService>;
    });

    describe('generateGrid', () => {
        it('should return grid and structures', () => {
            terrainUtils.countTerrainTiles.and.returnValue(TERRAIN_TILE_COUNT);
            positionUtils.getAdjacentPositions.and.returnValue([]);
            positionUtils.positionToKey.and.callFake((pos) => `${pos.x}-${pos.y}`);
            gameValidationService.validateBridge.and.returnValue(null);

            const result = service.generateGrid(MapSize.Small, GameMode.FFA);

            expect(result.tiles).toBeDefined();
            expect(result.structures).toBeDefined();
            expect(result.tiles.length).toBe(MapSize.Small);
        });

        it('should initialize tiles with all grass', () => {
            terrainUtils.countTerrainTiles.and.returnValue(TERRAIN_TILE_COUNT);
            positionUtils.getAdjacentPositions.and.returnValue([]);
            positionUtils.positionToKey.and.callFake((pos) => `${pos.x}-${pos.y}`);
            gameValidationService.validateBridge.and.returnValue(null);

            const result = service.generateGrid(MapSize.Small, GameMode.FFA);

            let grassCount = 0;
            for (const tiles of result.tiles) {
                for (const tile of tiles) {
                    if (tile === TileType.Grass) {
                        grassCount++;
                    }
                }
            }
            expect(grassCount).toBeGreaterThan(ZERO);
        });

        it('should store generated map data for comparison', () => {
            terrainUtils.countTerrainTiles.and.returnValue(TERRAIN_TILE_COUNT);
            positionUtils.getAdjacentPositions.and.returnValue([]);
            positionUtils.positionToKey.and.callFake((pos) => `${pos.x}-${pos.y}`);
            gameValidationService.validateBridge.and.returnValue(null);

            service.generateGrid(MapSize.Small, GameMode.CTF);

            expect(service.lastGeneratedMapData).not.toBeNull();
        });

        it('should generate different grids on retries', () => {
            terrainUtils.countTerrainTiles.and.returnValue(TERRAIN_TILE_COUNT);
            positionUtils.getAdjacentPositions.and.returnValue([]);
            positionUtils.positionToKey.and.callFake((pos) => `${pos.x}-${pos.y}`);
            gameValidationService.validateBridge.and.returnValue(null);
            terrainUtils.generateTerrainBodies.and.returnValue(ZERO);

            const result = service.generateGrid(MapSize.Small, GameMode.FFA);

            expect(result.tiles).toBeDefined();
        });
    });

    describe('initializeMapData', () => {
        it('should create map data with correct size', () => {
            const mapData = service['initializeMapData'](MapSize.Medium, GameMode.CTF);

            expect(mapData.tiles.length).toBe(MapSize.Medium);
            expect(mapData.tiles[0].length).toBe(MapSize.Medium);
        });

        it('should initialize all tiles as grass', () => {
            const mapData = service['initializeMapData'](MapSize.Small, GameMode.CTF);

            for (const tiles of mapData.tiles) {
                for (const tile of tiles) {
                    expect(tile).toBe(TileType.Grass);
                }
            }
        });

        it('should initialize empty items', () => {
            const mapData = service['initializeMapData'](MapSize.Small, GameMode.CTF);

            expect(Object.keys(mapData.items).length).toBe(ZERO);
        });

        it('should store size and game mode', () => {
            const mapData = service['initializeMapData'](MapSize.Large, GameMode.CTF);

            expect(mapData.size).toBe(MapSize.Large);
            expect(mapData.gameMode).toBe(GameMode.CTF);
        });
    });

    describe('getNumStructuresForMapSize', () => {
        it('should return 1 for small map', () => {
            const num = service['getNumStructuresForMapSize'](MapSize.Small);

            expect(num).toBe(SMALL_MAP_STRUCTURES);
        });

        it('should return 2 for medium map', () => {
            const num = service['getNumStructuresForMapSize'](MapSize.Medium);

            expect(num).toBe(MEDIUM_MAP_STRUCTURES);
        });

        it('should return 3 for large map', () => {
            const num = service['getNumStructuresForMapSize'](MapSize.Large);

            expect(num).toBe(LARGE_MAP_STRUCTURES);
        });
    });

    describe('getRandomInteriorSize', () => {
        it('should return size between 6 and 13', () => {
            const size = service['getRandomInteriorSize']();

            expect(size).toBeGreaterThanOrEqual(MIN_INTERIOR_SIZE);
            expect(size).toBeLessThanOrEqual(MAX_INTERIOR_SIZE);
        });
    });

    describe('generateStructureBorder', () => {
        it('should generate border around interior', () => {
            const interior: Position[] = [{ x: 5, y: 5 }];
            positionUtils.getAdjacentPositions.and.returnValue([
                { x: 4, y: 5 },
                { x: 6, y: 5 },
            ]);
            positionUtils.positionToKey.and.callFake((pos) => `${pos.x}-${pos.y}`);
            positionUtils.keyToPosition.and.callFake((key) => {
                const [x, y] = key.split('-').map(Number);
                return { x, y };
            });

            const border = service['generateStructureBorder'](interior, SMALL_STRUCTURE_SIZE);

            expect(border.length).toBeGreaterThan(ZERO);
        });
    });

    describe('findAdjacentCandidatesForGrowth', () => {
        it('should find adjacent candidates within bounds', () => {
            const interior: Position[] = [{ x: 5, y: 5 }];
            positionUtils.getAdjacentPositions.and.returnValue([
                { x: 5, y: 6 },
                { x: 6, y: 5 },
            ]);

            const candidates = service['findAdjacentCandidatesForGrowth'](interior, SMALL_STRUCTURE_SIZE);

            expect(candidates.length).toBeGreaterThan(ZERO);
        });

        it('should exclude positions at boundary', () => {
            const interior: Position[] = [{ x: 1, y: 1 }];
            positionUtils.getAdjacentPositions.and.returnValue([
                { x: 0, y: 1 },
                { x: 1, y: 0 },
                { x: 2, y: 1 },
            ]);

            const candidates = service['findAdjacentCandidatesForGrowth'](interior, SMALL_STRUCTURE_SIZE);

            expect(candidates).toContain({ x: 2, y: 1 });
            expect(candidates).not.toContain({ x: 0, y: 1 });
        });

        it('should exclude positions already in interior', () => {
            const interior: Position[] = [
                { x: 5, y: 5 },
                { x: 5, y: 6 },
            ];
            positionUtils.getAdjacentPositions.and.returnValue([
                { x: 5, y: 6 },
                { x: 6, y: 5 },
            ]);

            const candidates = service['findAdjacentCandidatesForGrowth'](interior, SMALL_STRUCTURE_SIZE);

            expect(candidates).not.toContain({ x: 5, y: 6 });
            expect(candidates).toContain({ x: 6, y: 5 });
        });

        it('should avoid duplicates', () => {
            const interior: Position[] = [
                { x: 5, y: 5 },
                { x: 5, y: 6 },
            ];
            positionUtils.getAdjacentPositions.and.returnValue([
                { x: 5, y: 7 },
                { x: 5, y: 7 },
            ]);

            const candidates = service['findAdjacentCandidatesForGrowth'](interior, SMALL_STRUCTURE_SIZE);

            const expectedCoords = { x: 5, y: 7 };
            const count = candidates.filter((c) => c.x === expectedCoords.x && c.y === expectedCoords.y).length;
            expect(count).toBe(1);
        });
    });

    describe('addRandomCandidatesToInterior', () => {
        it('should add candidates to interior', () => {
            const interior: Position[] = [{ x: 5, y: 5 }];
            const candidates: Position[] = [
                { x: 5, y: 6 },
                { x: 6, y: 5 },
            ];

            service['addRandomCandidatesToInterior'](interior, candidates, GROWTH_SIZE);

            expect(interior.length).toBeGreaterThan(1);
        });

        it('should not exceed max size', () => {
            const interior: Position[] = [{ x: 5, y: 5 }];
            const totalCandidates = 10;
            const posBase = 5;
            const candidates: Position[] = Array(totalCandidates)
                .fill(null)
                .map((_, i) => ({ x: posBase + i, y: posBase }));

            const maxSize = 3;
            service['addRandomCandidatesToInterior'](interior, candidates, maxSize);

            expect(interior.length).toBeLessThanOrEqual(maxSize);
        });

        it('should remove added candidates from list', () => {
            const interior: Position[] = [{ x: 5, y: 5 }];
            const candidates: Position[] = [
                { x: 5, y: 6 },
                { x: 6, y: 5 },
            ];
            const initialCandidateCount = candidates.length;

            const maxSize = 10;
            service['addRandomCandidatesToInterior'](interior, candidates, maxSize);

            expect(candidates.length).toBeLessThanOrEqual(initialCandidateCount);
        });
    });

    describe('isCompleteMapIdentical', () => {
        it('should return false if no previous map', () => {
            service.lastGeneratedMapData = null;
            const currentMap: MapData = {
                tiles: [],
                items: {} as Record<string, Position[]>,
                size: MapSize.Small,
                gameMode: GameMode.CTF,
            };

            const result = service.isCompleteMapIdentical(currentMap);

            expect(result).toBe(false);
        });

        it('should return false if size differs', () => {
            service.lastGeneratedMapData = {
                tiles: [],
                items: {} as Record<string, Position[]>,
                size: MapSize.Small,
                gameMode: GameMode.CTF,
            };
            const currentMap: MapData = {
                tiles: [],
                items: {} as Record<string, Position[]>,
                size: MapSize.Medium,
                gameMode: GameMode.CTF,
            };

            const result = service.isCompleteMapIdentical(currentMap);

            expect(result).toBe(false);
        });
    });

    describe('updateLastGeneratedMapData', () => {
        it('should store map data for comparison', () => {
            const mapData: MapData = {
                tiles: [[TileType.Grass]],
                items: {} as Record<ItemType, Position[]>,
                size: MapSize.Small,
                gameMode: GameMode.FFA,
            };

            service.updateLastGeneratedMapData(mapData);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(service.lastGeneratedMapData!.size).toBe(MapSize.Small);
        });

        it('should deep clone map data', () => {
            const mapData: MapData = {
                tiles: [[TileType.Grass]],
                items: {} as Record<ItemType, Position[]>,
                size: MapSize.Small,
                gameMode: GameMode.FFA,
            };

            service.updateLastGeneratedMapData(mapData);
            mapData.tiles[ZERO][ZERO] = TileType.Water;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(service.lastGeneratedMapData!.tiles[ZERO][ZERO]).toBe(TileType.Grass);
        });
    });
});
