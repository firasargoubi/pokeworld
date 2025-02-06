import { TestBed } from '@angular/core/testing';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { BridgeError } from '@app/interfaces/game-validation-errors';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { GameValidationService } from './game-validation.service';

const GRASS = TileType.Grass;
const PATH = TileType.Path;
const BUSH = TileType.Bush;
const WATER = TileType.Water;
const BRIDGE = TileType.Bridge;
const BROKEN_BRIDGE = TileType.BrokenBridge;

// const REQUIRED_SPAWN_POINTS: Record<MapSize, number> = {
//     [MapSize.Small]: 2,
//     [MapSize.Medium]: 4,
//     [MapSize.Large]: 6,
// };
// const MIN_TERRAIN_RATIO = 0.5;
const PERCENTAGE_FACTOR = 100;

describe('II-GameValidationService', () => {
    let service: GameValidationService;
    // const map = {
    //     tiles: Array.from({ length: MapSize.Medium }, () => Array(MapSize.Medium).fill(GRASS)),
    //     gameMode: GameMode.CTF,
    //     size: MapSize.Medium,
    // } as MapData;

    // const game: GameData = {
    //     _id: '1',
    //     name: 'ValidGameName',
    //     description: 'ValidGameDescription',
    //     mapData: map,
    //     lastEdited: new Date(),
    //     isVisible: true,
    //     thumbnail: 'assets/tileset/grass.png',
    // };
    // const maxLength = 20;
    // const PERCENTAGE_FACTOR = 100;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameValidationService],
        });
        service = TestBed.inject(GameValidationService);
        service['validationErrors'] = {
            name: { isValid: true, errorCode: null },
            description: { isValid: true, errorCode: null },
            terrainCoverage: { isValid: true, coveragePercentage: 100 },
            bridge: { isValid: true, errors: [] },
            spawnPoint: { isValid: true, errorCode: 0 },
            tilesAccessibility: { isValid: true, nonAccessibleTileCount: 0 },
            mode: { isValid: true, errorCode: null },
            items: { isValid: true, misplacedItems: [] },
        };
    });

    it('validateTerrainCoverage should return true when terrain coverage is above the minimum ratio', () => {
        const validCases = [
            { nbTerrain: 80, nbTilesTotal: 100, nbWater: 10, nbBridge: 10 },
            { nbTerrain: 51, nbTilesTotal: 100, nbWater: 25, nbBridge: 24 },
        ];

        validCases.forEach((tilesCount) => {
            service['tilesCount'] = tilesCount;

            const result = service['validateTerrainCoverage']();

            expect(service['validationErrors'].terrainCoverage.isValid).toBeTrue();
            expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBeCloseTo(
                (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * PERCENTAGE_FACTOR,
                2,
            );
            expect(result).toBeTrue();
        });
    });

    it('validateTerrainCoverage should return false when terrain coverage is below the minimum ratio', () => {
        const validCases = [
            { nbTerrain: 10, nbTilesTotal: 100, nbWater: 80, nbBridge: 10 },
            { nbTerrain: 50, nbTilesTotal: 100, nbWater: 25, nbBridge: 25 },
        ];

        validCases.forEach((tilesCount) => {
            service['tilesCount'] = tilesCount;

            const result = service['validateTerrainCoverage']();

            expect(service['validationErrors'].terrainCoverage.isValid).toBeFalse();
            expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBeCloseTo(
                (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * PERCENTAGE_FACTOR,
                2,
            );
            expect(result).toBeFalse();
        });
    });

    it('validateTilesAccessibility should return true when all traversable tiles are accessible', () => {
        const validMap: MapData = {
            tiles: [
                [GRASS, BUSH, GRASS],
                [WATER, BROKEN_BRIDGE, WATER],
                [GRASS, PATH, BUSH],
            ],
        } as MapData;

        service['tilesCount'] = { nbTerrain: 6, nbBridge: 1, nbWater: 2, nbTilesTotal: 9 };

        const result = service['validateTilesAccessibility'](validMap);

        expect(service['validationErrors'].tilesAccessibility.isValid).toBeTrue();
        expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toBe(0);
        expect(result).toBeTrue();
    });

    it('validateTilesAccessibility should return false when some traversable tiles are not accessible', () => {
        const testCases = [
            {
                tiles: [
                    [GRASS, WATER, GRASS],
                    [GRASS, PATH, WATER],
                    [GRASS, BRIDGE, GRASS],
                ],
                tilesCount: { nbTerrain: 6, nbBridge: 1, nbWater: 2, nbTilesTotal: 9 },
                expectedNonAccessibleTiles: 1,
            },
            {
                tiles: [
                    [GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER],
                    [GRASS, GRASS, GRASS],
                ],
                tilesCount: { nbTerrain: 6, nbBridge: 0, nbWater: 3, nbTilesTotal: 9 },
                expectedNonAccessibleTiles: 3,
            },
        ];

        testCases.forEach(({ tiles, tilesCount, expectedNonAccessibleTiles }) => {
            const invalidMap = { tiles } as MapData;
            service['tilesCount'] = tilesCount;

            const result = service['validateTilesAccessibility'](invalidMap);

            expect(service['validationErrors'].tilesAccessibility.isValid).toBeFalse();
            expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toBe(expectedNonAccessibleTiles);
            expect(result).toBeFalse();
        });
    });

    it('handleTile should correctly increment tile counters based on tile type', () => {
        let testCases = [
            {
                tile: TileType.Water,
                expectedCounts: { nbWater: 1, nbBridge: 0, nbTerrain: 0, nbTilesTotal: 1 },
                shouldValidateBridge: false,
            },
            {
                tile: TileType.Grass,
                expectedCounts: { nbWater: 0, nbBridge: 0, nbTerrain: 1, nbTilesTotal: 1 },
            },
            {
                tile: TileType.Path,
                expectedCounts: { nbWater: 0, nbBridge: 0, nbTerrain: 1, nbTilesTotal: 1 },
            },
            {
                tile: TileType.Bush,
                expectedCounts: { nbWater: 0, nbBridge: 0, nbTerrain: 1, nbTilesTotal: 1 },
            },
        ];

        spyOn(service, 'validateBridge').and.stub();

        testCases.forEach(({ tile, expectedCounts }) => {
            const map: MapData = { tiles: [[tile]] } as MapData;
            service['tilesCount'] = { nbWater: 0, nbBridge: 0, nbTerrain: 0, nbTilesTotal: 0 };

            service['handleTile']({ x: 0, y: 0 }, map);

            expect(service['tilesCount'].nbWater).toBe(expectedCounts.nbWater);
            expect(service['tilesCount'].nbBridge).toBe(expectedCounts.nbBridge);
            expect(service['tilesCount'].nbTerrain).toBe(expectedCounts.nbTerrain);
            expect(service['tilesCount'].nbTilesTotal).toBe(expectedCounts.nbTilesTotal);

            expect(service.validateBridge).not.toHaveBeenCalled();
        });

        testCases = [
            {
                tile: TileType.Bridge,
                expectedCounts: { nbWater: 0, nbBridge: 1, nbTerrain: 0, nbTilesTotal: 1 },
                shouldValidateBridge: true,
            },
            {
                tile: TileType.BrokenBridge,
                expectedCounts: { nbWater: 0, nbBridge: 1, nbTerrain: 0, nbTilesTotal: 1 },
                shouldValidateBridge: true,
            },
        ];

        testCases.forEach(({ tile, expectedCounts }) => {
            const map: MapData = { tiles: [[tile]] } as MapData;
            service['tilesCount'] = { nbWater: 0, nbBridge: 0, nbTerrain: 0, nbTilesTotal: 0 };

            service['handleTile']({ x: 0, y: 0 }, map);

            expect(service['tilesCount'].nbWater).toBe(expectedCounts.nbWater);
            expect(service['tilesCount'].nbBridge).toBe(expectedCounts.nbBridge);
            expect(service['tilesCount'].nbTerrain).toBe(expectedCounts.nbTerrain);
            expect(service['tilesCount'].nbTilesTotal).toBe(expectedCounts.nbTilesTotal);

            expect(service.validateBridge).toHaveBeenCalledWith({ x: 0, y: 0 }, map);
        });
    });

    describe('e2e-Validation', () => {
        it('validateGame should return true if all validation checks pass', () => {
            const items = {
                [ItemType.Spawn]: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                ],
                [ItemType.Flag]: [{ x: 1, y: 1 }],
            } as Record<ItemType, Position[]>;

            const map: MapData = {
                items,
                gameMode: GameMode.CTF,
                size: MapSize.Small,
                tiles: [
                    [GRASS, PATH, GRASS, GRASS, WATER, GRASS, GRASS, GRASS, BUSH, WATER],
                    [GRASS, PATH, GRASS, GRASS, WATER, GRASS, GRASS, WATER, BRIDGE, WATER],
                    [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, PATH, WATER],
                    [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
                    [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
                    [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, BROKEN_BRIDGE, WATER],
                    [BUSH, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
                    [GRASS, PATH, GRASS, GRASS, WATER, WATER, GRASS, GRASS, GRASS, WATER],
                    [GRASS, BUSH, BUSH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
                    [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
                ],
            };

            const game = {
                name: 'testGame',
                description: 'testDescription',
                mapData: map,
            } as GameData;

            service.validateGame(game);
            expect(service['validationErrors'].name.isValid).toBeTrue();
            expect(service['validationErrors'].description.isValid).toBeTrue();
            expect(service['validationErrors'].terrainCoverage.isValid).toBeTrue();
            expect(service['validationErrors'].bridge.isValid).toBeTrue();
            expect(service['validationErrors'].spawnPoint.isValid).toBeTrue();
            expect(service['validationErrors'].tilesAccessibility.isValid).toBeTrue();
        });

        it('validateGame should return false when name, description, and terrainCoverage are invalid', () => {
            const TERRAIN_COVERAGE = 50;
            const items = {
                [ItemType.Spawn]: [
                    { x: 0, y: 9 },
                    { x: 1, y: 9 },
                ],
                [ItemType.Flag]: [{ x: 1, y: 1 }],
            } as Record<ItemType, Position[]>;

            const map: MapData = {
                items,
                gameMode: GameMode.CTF,
                size: MapSize.Small,
                tiles: [
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                    [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
                ],
            };

            const game = {
                name: '',
                description: '',
                mapData: map,
            } as GameData;

            service.validateGame(game);
            expect(service['validationErrors'].name.isValid).toBeFalse();
            expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.Empty);

            expect(service['validationErrors'].description.isValid).toBeFalse();
            expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.Empty);

            expect(service['validationErrors'].terrainCoverage.isValid).toBeFalse();
            expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(TERRAIN_COVERAGE);

            expect(service['validationErrors'].bridge.isValid).toBeTrue();
            expect(service['validationErrors'].spawnPoint.isValid).toBeTrue();
            expect(service['validationErrors'].tilesAccessibility.isValid).toBeTrue();
        });

        it('validateGame should return false when bridge, spawnPoint, and tilesAccessibility are invalid', () => {
            const nonAccessibleTileCount = 15;
            const items = {
                [ItemType.Spawn]: [
                    { x: 0, y: 0 },
                    { x: 0, y: 7 },
                ],
                [ItemType.Flag]: [{ x: 1, y: 1 }],
            } as Record<ItemType, Position[]>;

            const map: MapData = {
                items,
                gameMode: GameMode.CTF,
                size: MapSize.Small,
                tiles: [
                    [GRASS, WATER, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS, GRASS],
                    [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS, GRASS],
                    [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS, GRASS],
                    [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, BRIDGE, WATER, GRASS],
                    [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
                    [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
                    [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
                    [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
                    [WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
                    [GRASS, GRASS, WATER, BRIDGE, GRASS, GRASS, GRASS, BRIDGE, WATER, GRASS],
                ],
            };

            const game = {
                name: 'TestName',
                description: 'TestDescription',
                mapData: map,
            } as GameData;

            service.validateGame(game);
            expect(service['validationErrors'].name.isValid).toBeTrue();
            expect(service['validationErrors'].description.isValid).toBeTrue();
            expect(service['validationErrors'].terrainCoverage.isValid).toBeTrue();

            expect(service['validationErrors'].tilesAccessibility.isValid).toBeFalse();
            expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toEqual(nonAccessibleTileCount);

            expect(service['validationErrors'].bridge.isValid).toBeFalse();
            expect(service['validationErrors'].bridge.errors).toEqual([
                { x: 3, y: 7, errorCode: ErrorCode.BridgeNotBetweenWalls } as BridgeError,
                { x: 9, y: 3, errorCode: ErrorCode.BridgeAtEdge } as BridgeError,
                { x: 9, y: 7, errorCode: ErrorCode.BridgeAtEdge } as BridgeError,
            ]);

            expect(service['validationErrors'].items.isValid).toBeFalse();
        });
    });
});
