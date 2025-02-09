import { TestBed } from '@angular/core/testing';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { BridgeValidationError, ValidationResult, ValidationStatus } from '@app/interfaces/game-validation-result';
import { TilesCount } from '@app/interfaces/tiles-count';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { GameValidationService } from './game-validation.service';
import { VALIDATION_TESTS_CASES } from './validation-tests-cases.spec';

describe('GameValidationService', () => {
    let service: GameValidationService;
    const map = {
        tiles: Array.from({ length: MapSize.Medium }, () => Array(MapSize.Medium).fill(TileType.Grass)),
        gameMode: GameMode.CTF,
        size: MapSize.Medium,
    } as MapData;

    const game: GameData = {
        _id: '1',
        name: 'ValidGameName',
        description: 'ValidGameDescription',
        mapData: map,
        lastEdited: new Date(),
        isVisible: true,
        thumbnail: 'assets/tileset/grass.png',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameValidationService],
        });
        service = TestBed.inject(GameValidationService);
    });

    it('validateGame should invoke validateName, validateDescription, and validateMap with the correct parameters', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateMap').and.returnValue({ name: {} as ValidationStatus, description: {} as ValidationStatus } as ValidationResult);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateName').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateDescription').and.stub();

        service.validateGame(game);

        expect(service['validateName']).toHaveBeenCalledTimes(1);
        expect(service['validateName']).toHaveBeenCalledWith(game.name);

        expect(service['validateDescription']).toHaveBeenCalledTimes(1);
        expect(service['validateDescription']).toHaveBeenCalledWith(game.description);

        expect(service['validateMap']).toHaveBeenCalledTimes(1);
        expect(service['validateMap']).toHaveBeenCalledWith(game.mapData);
    });

    it('validateName should validate a correct game name', () => {
        const result = service['validateName'](game.name);
        expect(result).toEqual({ isValid: true, errorCode: null });
    });

    it('validateName should return false for an empty or overly long game name', () => {
        let gameName = '';
        let result = service['validateName'](gameName);
        expect(result).toEqual({ isValid: false, errorCode: ErrorCode.Empty });

        const longGameName = 100;
        gameName = 'A'.repeat(longGameName);
        result = service['validateName'](gameName);
        expect(result).toEqual({ isValid: false, errorCode: ErrorCode.TooLong });
    });

    it('validateDescription should validate a correct game description', () => {
        const result = service['validateDescription'](game.description);
        expect(result).toEqual({ isValid: true, errorCode: null });
    });

    it('validateDescription should invalidate an empty or excessively long game description', () => {
        let gameDescription = '';
        let result = service['validateDescription'](gameDescription);
        expect(result).toEqual({ isValid: false, errorCode: ErrorCode.Empty });

        const GAME_DESCRIPTION_TOO_LONG = 400;
        gameDescription = 'A'.repeat(GAME_DESCRIPTION_TOO_LONG);
        result = service['validateDescription'](gameDescription);
        expect(result).toEqual({ isValid: false, errorCode: ErrorCode.TooLong });
    });

    it('validateMap should process tiles and validate terrain, spawn points, items, and flags', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'handleTile').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateTilesAccessibility').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateTerrainCoverage').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateSpawnPoints').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateItemPlacement').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateFlags').and.stub();
        service['validateMap'](game.mapData);

        expect(service['handleTile']).toHaveBeenCalledTimes(game.mapData.size * game.mapData.size);

        expect(service['validateTerrainCoverage']).toHaveBeenCalledTimes(1);
        expect(service['validateTerrainCoverage']).toHaveBeenCalledWith({ nbWater: 0, nbBridge: 0, nbTerrain: 0, nbTilesTotal: 0 });

        expect(service['validateTilesAccessibility']).toHaveBeenCalledTimes(1);
        expect(service['validateTilesAccessibility']).toHaveBeenCalledWith(game.mapData, {
            nbWater: 0,
            nbBridge: 0,
            nbTerrain: 0,
            nbTilesTotal: 0,
        });

        expect(service['validateSpawnPoints']).toHaveBeenCalledTimes(1);
        expect(service['validateSpawnPoints']).toHaveBeenCalledWith(game.mapData);

        expect(service['validateItemPlacement']).toHaveBeenCalledTimes(1);
        expect(service['validateItemPlacement']).toHaveBeenCalledWith(game.mapData);

        expect(service['validateFlags']).toHaveBeenCalledTimes(1);
        expect(service['validateFlags']).toHaveBeenCalledWith(game.mapData);

        const ffaMap = game.mapData;
        ffaMap.gameMode = GameMode.FFA;

        service['validateMap'](ffaMap);
        expect(service['validateFlags']).toHaveBeenCalledTimes(1);
    });

    it('validateBridge should validate a valid bridge and return true', () => {
        const testCases = VALIDATION_TESTS_CASES.validBridges;

        testCases.forEach((tiles) => {
            const validBridgeMap = { tiles } as MapData;
            const result = service['validateBridge']({ x: 1, y: 1 }, validBridgeMap);
            expect(result).toBeNull();
        });
    });

    it('validateBridge should invalidate an invalid bridge and return false', () => {
        const testCases = VALIDATION_TESTS_CASES.invalidBridges;

        testCases.forEach(({ tiles, position, expectedError }) => {
            const invalidBridgeMap = { tiles } as MapData;

            const result = service['validateBridge'](position, invalidBridgeMap);
            expect(result).toEqual({ x: position.x, y: position.y, errorCode: expectedError });
        });
    });

    it('validateSpawnPoints should return true when the correct number of spawn points are placed', () => {
        const testCase = VALIDATION_TESTS_CASES.validSpawnPointCase;

        const result = service['validateSpawnPoints'](testCase);
        expect(result).toEqual({ isValid: true, errorCode: null });
    });

    it('validateSpawnPoints should return false when the number of spawn points is incorrect', () => {
        const testCases = VALIDATION_TESTS_CASES.invalidSpawnPointCases;

        testCases.forEach(({ items, size, errorCode }) => {
            const mapCase = { items, size } as MapData;

            const result = service['validateSpawnPoints'](mapCase);
            expect(result).toEqual({ isValid: false, errorCode });
        });
    });

    it('validateFlags should validate flags when exactly one flag is placed', () => {
        const testCases = VALIDATION_TESTS_CASES.validFalgCase;

        const result = service['validateFlags'](testCases);
        expect(result).toEqual({ isValid: true, errorCode: null });
    });

    it('validateFlags should invalidate flags when the number of flags is incorrect', () => {
        const testCases = VALIDATION_TESTS_CASES.invalidFlagCases;

        testCases.forEach(({ items, size, errorCode }) => {
            const mapCase = { items, size } as MapData;

            const result = service['validateFlags'](mapCase);
            expect(result).toEqual({ isValid: false, errorCode });
        });
    });

    it('validateItems should return validate items when all items are placed on traversable tiles', () => {
        const testCases = VALIDATION_TESTS_CASES.validItemsCase;

        const result = service['validateItemPlacement'](testCases);
        expect(result).toEqual({ isValid: true, misplacedItems: [] });
    });

    it('validateItems should invalidate items when items are placed on non-traversable tiles', () => {
        const testCases = VALIDATION_TESTS_CASES.invalidItemsCase;

        const result = service['validateItemPlacement'](testCases.invalidMap);
        expect(result).toEqual({ isValid: false, misplacedItems: testCases.misplacedItems });
    });

    it('validateTerrainCoverage should validate coverage when terrain coverage is above the minimum ratio', () => {
        const testCases = VALIDATION_TESTS_CASES.validTerrainCoverageCases;

        testCases.forEach((tilesCount) => {
            const result = service['validateTerrainCoverage'](tilesCount);
            expect(result).toEqual({
                isValid: true,
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                coveragePercentage: (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * 100,
            });
        });
    });

    it('validateTerrainCoverage should invalidate coverage when terrain coverage is below the minimum ratio', () => {
        const testCases = VALIDATION_TESTS_CASES.invalidTerrainCoverageCases;

        testCases.forEach((tilesCount) => {
            const result = service['validateTerrainCoverage'](tilesCount);

            expect(result).toEqual({
                isValid: false,
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                coveragePercentage: (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * 100,
            });
        });
    });

    it('validateTilesAccessibility should validate accessibility when all traversable tiles are accessible', () => {
        const testCases = VALIDATION_TESTS_CASES.validTilesAccessibilityCase;
        const result = service['validateTilesAccessibility'](testCases.map, testCases.tilesCount);
        expect(result).toEqual({ isValid: true, nonAccessibleTileCount: 0 });
    });

    it('validateTilesAccessibility should invalidate accessibility when some traversable tiles are not accessible', () => {
        const testCases = VALIDATION_TESTS_CASES.invalidTilesAccessibilityCases;

        testCases.forEach(({ tiles, tilesCount, expectedNonAccessibleTiles }) => {
            const invalidMap = { tiles } as MapData;
            const result = service['validateTilesAccessibility'](invalidMap, tilesCount);
            expect(result).toEqual({ isValid: false, nonAccessibleTileCount: expectedNonAccessibleTiles });
        });
    });

    it('handleTile should correctly increment tile counters based on tile type', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'validateBridge').and.returnValue({ x: 0, y: 0, errorCode: ErrorCode.BridgeAtEdge });

        let testCases = VALIDATION_TESTS_CASES.handleTileNoBridgeCases;
        const bridgeStatus = { isValid: true, errors: [] } as { isValid: boolean; errors: BridgeValidationError[] };

        testCases.forEach(({ tile, expectedCounts }) => {
            const testMap: MapData = { tiles: [[tile]] } as MapData;
            const initialtilesCount: TilesCount = {
                nbWater: 0,
                nbBridge: 0,
                nbTerrain: 0,
                nbTilesTotal: 0,
            };

            service['handleTile']({ x: 0, y: 0 }, testMap, initialtilesCount, bridgeStatus);

            expect(initialtilesCount.nbWater).toBe(expectedCounts.nbWater);
            expect(initialtilesCount.nbBridge).toBe(expectedCounts.nbBridge);
            expect(initialtilesCount.nbTerrain).toBe(expectedCounts.nbTerrain);
            expect(initialtilesCount.nbTilesTotal).toBe(expectedCounts.nbTilesTotal);

            expect(service['validateBridge']).not.toHaveBeenCalled();
        });

        testCases = VALIDATION_TESTS_CASES.handleTileWithBridgeCases;

        testCases.forEach(({ tile, expectedCounts }) => {
            const testMap: MapData = { tiles: [[tile]] } as MapData;
            const initialtilesCount: TilesCount = {
                nbWater: 0,
                nbBridge: 0,
                nbTerrain: 0,
                nbTilesTotal: 0,
            };

            service['handleTile']({ x: 0, y: 0 }, testMap, initialtilesCount, bridgeStatus);

            expect(initialtilesCount.nbWater).toBe(expectedCounts.nbWater);
            expect(initialtilesCount.nbBridge).toBe(expectedCounts.nbBridge);
            expect(initialtilesCount.nbTerrain).toBe(expectedCounts.nbTerrain);
            expect(initialtilesCount.nbTilesTotal).toBe(expectedCounts.nbTilesTotal);

            expect(service['validateBridge']).toHaveBeenCalledWith({ x: 0, y: 0 }, testMap);
            expect(bridgeStatus.isValid).toBeFalse();
            expect(bridgeStatus.errors).toContain({ x: 0, y: 0, errorCode: ErrorCode.BridgeAtEdge });
        });
    });
});
