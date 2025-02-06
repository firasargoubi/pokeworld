import { TestBed } from '@angular/core/testing';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { GameValidationService } from './game-validation.service';

const GRASS = TileType.Grass;
const PATH = TileType.Path;
const BUSH = TileType.Bush;
const WATER = TileType.Water;
const BRIDGE = TileType.Bridge;
const BROKEN_BRIDGE = TileType.BrokenBridge;

const REQUIRED_SPAWN_POINTS: Record<MapSize, number> = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};

describe('I-GameValidationService', () => {
    let service: GameValidationService;
    const map = {
        tiles: Array.from({ length: MapSize.Medium }, () => Array(MapSize.Medium).fill(GRASS)),
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

    describe('validateGame', () => {
        beforeEach(() => {
            spyOn(service, 'validateName').and.stub();
            spyOn(service, 'validateDescription').and.stub();
            spyOn(service, 'validateMap').and.stub();
        });

        it('validateGame should call validateName, validateDescription, and validateMap with correct parameters', () => {
            service.validateGame(game);

            expect(service['validateName']).toHaveBeenCalledTimes(1);
            expect(service['validateName']).toHaveBeenCalledWith(game.name);

            expect(service['validateDescription']).toHaveBeenCalledTimes(1);
            expect(service['validateDescription']).toHaveBeenCalledWith(game.description);

            expect(service['validateMap']).toHaveBeenCalledTimes(1);
            expect(service['validateMap']).toHaveBeenCalledWith(game.mapData);
        });

        it('validateGame should return true if all validation checks pass', () => {
            const result = service.validateGame(game);
            expect(result).toBeTrue();
        });

        it('validateGame should return false if any validation fails', () => {
            service['validationErrors'].name = { isValid: false, errorCode: ErrorCode.Empty };

            const result = service.validateGame(game);
            expect(result).toBeFalse();
        });
    });

    it('validateName should validate a valid game name and return true', () => {
        const result = service['validateName'](game.name);
        expect(service['validationErrors'].name.isValid).toBeTrue();
        expect(service['validationErrors'].name.errorCode).toBeNull();
        expect(result).toBeTrue();
    });

    it('validateName should return false for an empty or excessively long game name', () => {
        let gameName = '';
        let result = service['validateName'](gameName);
        expect(service['validationErrors'].name.isValid).toBeFalse();
        expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.Empty);
        expect(result).toBeFalse();

        const longGameName = 100;
        gameName = 'A'.repeat(longGameName);
        result = service['validateName'](gameName);
        expect(service['validationErrors'].name.isValid).toBeFalse();
        expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.TooLong);
        expect(result).toBeFalse();
    });

    it('validateDescription should validate a valid game description', () => {
        const result = service['validateDescription'](game.description);
        expect(service['validationErrors'].description.isValid).toBeTrue();
        expect(service['validationErrors'].description.errorCode).toBeNull();
        expect(result).toBeTrue();
    });

    it('validateDescription should invalidate an empty or excessively long game description', () => {
        let gameDescription = '';
        let result = service['validateDescription'](gameDescription);
        expect(service['validationErrors'].description.isValid).toBeFalse();
        expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.Empty);
        expect(result).toBeFalse();

        const GAME_DESCRIPTION_TOO_LONG = 400;
        gameDescription = 'A'.repeat(GAME_DESCRIPTION_TOO_LONG);
        result = service['validateDescription'](gameDescription);
        expect(service['validationErrors'].description.isValid).toBeFalse();
        expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.TooLong);
        expect(result).toBeFalse();
    });

    describe('validateMap', () => {
        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spyOn<any>(service, 'handleTile').and.stub();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spyOn<any>(service, 'validateTilesAccessibility').and.stub();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spyOn<any>(service, 'validateTerrainCoverage').and.stub();

            spyOn(service, 'validateSpawnPoints').and.stub();
            spyOn(service, 'validateItemPlacement').and.stub();
            spyOn(service, 'validateFlags').and.stub();
        });

        it('validateMap should process tiles and validate terrain, spawn points, items, and flags', () => {
            service.validateMap(game.mapData);

            expect(service['handleTile']).toHaveBeenCalledTimes(game.mapData.size * game.mapData.size);

            expect(service['validateTerrainCoverage']).toHaveBeenCalledTimes(1);
            expect(service['validateTerrainCoverage']).toHaveBeenCalledWith();

            expect(service['validateTilesAccessibility']).toHaveBeenCalledTimes(1);
            expect(service['validateTilesAccessibility']).toHaveBeenCalledWith(game.mapData);

            expect(service['validateSpawnPoints']).toHaveBeenCalledTimes(1);
            expect(service['validateSpawnPoints']).toHaveBeenCalledWith(game.mapData);

            expect(service['validateItemPlacement']).toHaveBeenCalledTimes(1);
            expect(service['validateItemPlacement']).toHaveBeenCalledWith(game.mapData);

            expect(service['validateFlags']).toHaveBeenCalledTimes(1);
            expect(service['validateFlags']).toHaveBeenCalledWith(game.mapData);
        });

        it('validateMap should return true if all validation checks pass', () => {
            const result = service.validateGame(game);
            expect(result).toBeTrue();
        });

        it('validateMap should return false if any validation fails', () => {
            service['validationErrors'].bridge = { isValid: false, errors: [] };

            const result = service.validateGame(game);
            expect(result).toBeFalse();
        });
    });

    it('validateBridge should validate a valid bridge and return true', () => {
        const testCases = [
            [
                [GRASS, PATH, GRASS],
                [WATER, BRIDGE, WATER],
                [GRASS, BUSH, GRASS],
            ],

            [
                [GRASS, WATER, GRASS],
                [GRASS, BRIDGE, BUSH],
                [GRASS, WATER, GRASS],
            ],
        ];

        testCases.forEach((tiles) => {
            const validBridgeMap = { tiles } as MapData;

            const result = service['validateBridge']({ x: 1, y: 1 }, validBridgeMap);

            expect(service['validationErrors'].bridge.isValid).toBeTrue();
            expect(service['validationErrors'].bridge.errors.length).toBe(0);
            expect(result).toBeTrue();
        });
    });

    it('validateBridge should invalidate an invalid bridge and return false', () => {
        const testCases = [
            {
                tiles: [
                    [BRIDGE, WATER, GRASS],
                    [WATER, GRASS, PATH],
                    [GRASS, BUSH, GRASS],
                ],
                position: { x: 0, y: 0 },
                expectedError: ErrorCode.BridgeAtEdge,
            },
            {
                tiles: [
                    [GRASS, PATH, GRASS],
                    [GRASS, BRIDGE, GRASS],
                    [GRASS, BUSH, GRASS],
                ],
                position: { x: 1, y: 1 },
                expectedError: ErrorCode.BridgeNotBetweenWalls,
            },
            {
                tiles: [
                    [GRASS, WATER, GRASS],
                    [WATER, BRIDGE, GRASS],
                    [GRASS, WATER, GRASS],
                ],
                position: { x: 1, y: 1 },
                expectedError: ErrorCode.BridgeNotBetweenWalls,
            },
            {
                tiles: [
                    [GRASS, BUSH, GRASS],
                    [WATER, BRIDGE, GRASS],
                    [GRASS, WATER, GRASS],
                ],
                position: { x: 1, y: 1 },
                expectedError: ErrorCode.BridgeNotBetweenWalls,
            },
        ];

        testCases.forEach(({ tiles, position, expectedError }) => {
            const invalidBridgeMap = { tiles } as MapData;

            const result = service['validateBridge'](position, invalidBridgeMap);

            expect(service['validationErrors'].bridge.isValid).toBeFalse();
            expect(service['validationErrors'].bridge.errors).toContain(
                jasmine.objectContaining({ x: position.x, y: position.y, errorCode: expectedError }),
            );
            expect(result).toBeFalse();
        });
    });

    it('validateSpawnPoints should return true when the correct number of spawn points are placed', () => {
        const validCase: MapData = {
            items: {
                [ItemType.Spawn]: Array.from({ length: REQUIRED_SPAWN_POINTS[MapSize.Small] }, (_, i) => ({ x: i, y: 0 })),
            },
            size: MapSize.Small,
        } as MapData;
        const result = service.validateSpawnPoints(validCase);

        expect(service['validationErrors'].spawnPoint.isValid).toBeTrue();
        expect(service['validationErrors'].spawnPoint.errorCode).toBeNull();
        expect(result).toBeTrue();
    });

    it('validateSpawnPoints should return false when the number of spawn points is incorrect', () => {
        const testCases = [
            {
                items: { [ItemType.Spawn]: Array(REQUIRED_SPAWN_POINTS[MapSize.Small] - 1).fill({}) },
                size: MapSize.Small,
                errorCode: ErrorCode.MissingRequiredItems,
            },
            {
                items: { [ItemType.Spawn]: Array(REQUIRED_SPAWN_POINTS[MapSize.Medium] + 2).fill({}) },
                size: MapSize.Medium,
                errorCode: ErrorCode.TooManyItems,
            },
            {
                items: { [ItemType.Spawn]: [] },
                size: MapSize.Large,
                errorCode: ErrorCode.MissingRequiredItems,
            },
        ];

        testCases.forEach(({ items, size, errorCode }) => {
            const mapCase = { items, size } as MapData;

            const result = service.validateSpawnPoints(mapCase);

            expect(service['validationErrors'].spawnPoint.isValid).toBeFalse();
            expect(service['validationErrors'].spawnPoint.errorCode).toBe(errorCode);
            expect(result).toBeFalse();
        });
    });

    it('validateFlags should return true when exactly one flag is placed', () => {
        const validCase: MapData = {
            items: {
                [ItemType.Flag]: [{ x: 0, y: 0 }],
            },
            size: MapSize.Small,
        } as MapData;

        const result = service.validateFlags(validCase);

        expect(service['validationErrors'].mode.isValid).toBeTrue();
        expect(service['validationErrors'].mode.errorCode).toBeNull();
        expect(result).toBeTrue();
    });

    it('validateFlags should return false when the number of flags is incorrect', () => {
        const testCases = [
            {
                items: { [ItemType.Flag]: [] },
                size: MapSize.Small,
                errorCode: ErrorCode.MissingRequiredItems,
            },
            {
                items: {
                    [ItemType.Flag]: [
                        { x: 0, y: 0 },
                        { x: 1, y: 1 },
                    ],
                },
                size: MapSize.Medium,
                errorCode: ErrorCode.TooManyItems,
            },
        ];

        testCases.forEach(({ items, size, errorCode }) => {
            const mapCase = { items, size } as MapData;

            const result = service.validateFlags(mapCase);

            expect(service['validationErrors'].mode.isValid).toBeFalse();
            expect(service['validationErrors'].mode.errorCode).toBe(errorCode);
            expect(result).toBeFalse();
        });
    });

    it('validateItems should return true when all items are placed on traversable tiles', () => {
        const validMap: MapData = {
            tiles: [[GRASS, BUSH, PATH]],
            items: {
                [ItemType.Flag]: [{ x: 0, y: 0 }],
                [ItemType.Spawn]: [
                    { x: 0, y: 1 },
                    { x: 0, y: 2 },
                ],
            },
        } as MapData;

        const result = service.validateItemPlacement(validMap);

        expect(service['validationErrors'].items.isValid).toBeTrue();
        expect(service['validationErrors'].items.misplacedItems.length).toBe(0);
        expect(result).toBeTrue();
    });

    it('validateItems should return false when items are placed on non-traversable tiles', () => {
        const invalidMap: MapData = {
            tiles: [[WATER, BRIDGE, BROKEN_BRIDGE]],
            items: {
                [ItemType.Flag]: [{ x: 0, y: 0 }],
                [ItemType.Spawn]: [
                    { x: 0, y: 1 },
                    { x: 0, y: 2 },
                ],
            },
        } as MapData;
        const misplacedItems = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
        ];

        const result = service.validateItemPlacement(invalidMap);

        expect(service['validationErrors'].items.isValid).toBeFalse();
        expect(service['validationErrors'].items.misplacedItems).toEqual(misplacedItems);
        expect(result).toBeFalse();
    });
});
