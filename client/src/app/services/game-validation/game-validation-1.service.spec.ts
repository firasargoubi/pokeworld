import { TestBed } from '@angular/core/testing';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { MapData } from '@common/map-data';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { GameValidationService } from './game-validation.service';
import { GameData } from '@common/game-data';
import { ValidationErrors } from '@app/interfaces/game-validation-errors';

describe('GameValidationService', () => {
    let service: GameValidationService;
    const game: GameData = {
        _id: '1',
        name: 'ValidGameName',
        description: 'ValidGameDescription',
        mapData: {} as MapData,
        lastEdited: new Date(),
        isVisible: true,
        thumbnail: 'assets/tileset/grass.png',
    };
    const maxLength = 20;
    const PERCENTAGE_FACTOR = 100;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameValidationService],
        });
        service = TestBed.inject(GameValidationService);
        service['validationErrors'] = {
            name: { isValid: true, errorCode: null },
            description: { isValid: true, errorCode: null },
            terrainCoverage: { isValid: true, coveragePercentage: 100 },
            spawnPoint: { isValid: true, spawnPointMissing: 0 },
            tilesAccessibility: { isValid: true, nonAccessibleTileCount: 0 },
            mode: { isValid: true, errorCode: null },
        } as ValidationErrors;
    });

    // À REVOIR duplication spyOn dans validateGame
    it('validateGame should call validateName, validateDescription, and validateMap with correct parameters', () => {
        spyOn(service, 'validateName').and.stub();
        spyOn(service, 'validateDescription').and.stub();
        spyOn(service, 'validateMap').and.stub();

        service.validateGame(game);

        expect(service['validateName']).toHaveBeenCalledTimes(1);
        expect(service['validateName']).toHaveBeenCalledWith(game.name);

        expect(service['validateDescription']).toHaveBeenCalledTimes(1);
        expect(service['validateDescription']).toHaveBeenCalledWith(game.description);

        expect(service['validateMap']).toHaveBeenCalledTimes(1);
        expect(service['validateMap']).toHaveBeenCalledWith(game.mapData);
    });

    it('validateGame should return true if all validation checks pass', () => {
        spyOn(service, 'validateName').and.stub();
        spyOn(service, 'validateDescription').and.stub();
        spyOn(service, 'validateMap').and.stub();
        const result = service.validateGame(game);
        expect(result).toBeTrue();
    });

    it('validateGame should return false if all validation fails', () => {
        spyOn(service, 'validateName').and.stub();
        spyOn(service, 'validateDescription').and.stub();
        spyOn(service, 'validateMap').and.stub();

        service['validationErrors'].name = { isValid: false, errorCode: ErrorCode.Empty };

        const result = service.validateGame(game);
        expect(result).toBeFalse();
    });

    it('validateName should call validateField with the correct parameters', () => {
        spyOn(service, 'validateField').and.callThrough();
        service['validateName'](game.name);
        expect(service['validateField']).toHaveBeenCalledTimes(1);
        expect(service['validateField']).toHaveBeenCalledWith(game.name, maxLength, 'name');
    });

    it('validateName should validate a valid game name', () => {
        service['validateName'](game.name);
        expect(service['validationErrors'].name.isValid).toBeTrue();
        expect(service['validationErrors'].name.errorCode).toBeNull();
    });

    it('validateName should return false for an empty or excessively long game name', () => {
        let gameName = '';
        service['validateName'](gameName);
        expect(service['validationErrors'].name.isValid).toBeFalse();
        expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.Empty);

        const longGameName = 50;
        gameName = 'A'.repeat(longGameName);
        service['validateName'](gameName);
        expect(service['validationErrors'].name.isValid).toBeFalse();
        expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.TooLong);
    });

    it('validateField should validate a valid field', () => {
        const value = 'ValidField';
        const field = 'name';

        service['validateField'](value, maxLength, field);
        expect(service['validationErrors'][field].isValid).toBeTrue();
        expect(service['validationErrors'][field].errorCode).toBeNull();
    });

    it('validateDescription should validate a valid game description', () => {
        service['validateDescription'](game.description);
        expect(service['validationErrors'].description.isValid).toBeTrue();
        expect(service['validationErrors'].name.errorCode).toBeNull();
    });

    it('validateDescription should invalidate an empty or excessively long game description', () => {
        let gameDescription = '';
        service['validateDescription'](gameDescription);
        expect(service['validationErrors'].description.isValid).toBeFalse();
        expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.Empty);

        const GAME_DESCRIPTION_TOO_LONG = 400;
        gameDescription = 'A'.repeat(GAME_DESCRIPTION_TOO_LONG);
        service['validateDescription'](gameDescription);
        expect(service['validationErrors'].description.isValid).toBeFalse();
        expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.TooLong);
    });

    beforeEach(() => {
        spyOn(service, 'validateTerrainCoverage').and.stub();
        spyOn(service, 'validateTilesAccessibility').and.stub();
        spyOn(service, 'validateSpawnPoints').and.stub();
    });

    it('should call handleTiles for each tile with the correct position', () => {
        spyOn(service, 'handleTiles').and.stub();
        const tilesCount = 4;
        const map = {
            tiles: [
                [TileType.Grass, TileType.Water],
                [TileType.Bridge, TileType.Path],
            ],
        } as MapData;

        service.validateMap(map);

        expect(service['handleTiles']).toHaveBeenCalledTimes(tilesCount);
        expect(service['handleTiles']).toHaveBeenCalledWith({ x: 0, y: 0 }, map);
        expect(service['handleTiles']).toHaveBeenCalledWith({ x: 0, y: 1 }, map);
        expect(service['handleTiles']).toHaveBeenCalledWith({ x: 1, y: 0 }, map);
        expect(service['handleTiles']).toHaveBeenCalledWith({ x: 1, y: 1 }, map);
    });

    it('should call validateTerrainCoverage once', () => {
        const map = {
            tiles: [
                [TileType.Grass, TileType.Water],
                [TileType.Bridge, TileType.Path],
            ],
        } as MapData;

        service.validateMap(map);

        expect(service['validateTerrainCoverage']).toHaveBeenCalledTimes(1);
    });

    it('should call validateTilesAccessibility once with the correct parameter', () => {
        const map = {
            tiles: [
                [TileType.Grass, TileType.Water],
                [TileType.Bridge, TileType.Path],
            ],
        } as MapData;

        service.validateMap(map);

        expect(service['validateTilesAccessibility']).toHaveBeenCalledTimes(1);
        expect(service['validateTilesAccessibility']).toHaveBeenCalledWith(map);
    });

    it('should call validateSpawnPoints once with the correct parameter', () => {
        const map = {
            tiles: [
                [TileType.Grass, TileType.Water],
                [TileType.Bridge, TileType.Path],
            ],
        } as MapData;

        service.validateMap(map);

        expect(service['validateSpawnPoints']).toHaveBeenCalledTimes(1);
        expect(service['validateSpawnPoints']).toHaveBeenCalledWith(map);
    });

    it('validateTerrainCoverage should validate if terrain coverage is above the threshold and update errorsStruct correctly', () => {
        service['tilesCount'] = { nbTerrain: 4, nbTilesTotal: 4, nbWater: 0, nbBridge: 0 };
        service.validateTerrainCoverage();

        expect(service['validationErrors'].terrainCoverage.isValid).toBeTrue();
        expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(PERCENTAGE_FACTOR);
    });

    it('validateTerrainCoverage should invalidate if terrain coverage is below or equal the threshold and update errorsStruct correctly', () => {
        let tilesCount = { nbTerrain: 2, nbTilesTotal: 4, nbWater: 3, nbBridge: 0 };
        let expectedTerrainPercentage = (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * PERCENTAGE_FACTOR;

        service['tilesCount'] = tilesCount;
        service['validateTerrainCoverage']();

        expect(service['validationErrors'].terrainCoverage.isValid).toBeFalse();
        expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(expectedTerrainPercentage);

        tilesCount = { nbTerrain: 2, nbTilesTotal: 4, nbWater: 2, nbBridge: 0 };
        expectedTerrainPercentage = (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * PERCENTAGE_FACTOR;

        service['tilesCount'] = { nbTerrain: 2, nbTilesTotal: 4, nbWater: 2, nbBridge: 0 };
        service['validateTerrainCoverage']();

        expect(service['validationErrors'].terrainCoverage.isValid).toBeFalse();
        expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(expectedTerrainPercentage);
    });

    it('validateBridges should add an error if isOnMapEdge returns true', () => {
        spyOn(service as unknown as { isOnMapEdge: (position: Position, map: MapData) => boolean }, 'isOnMapEdge').and.returnValue(true);
        spyOn(
            service as unknown as { isCorrectlyPlacedBridge: (position: Position, map: MapData) => boolean },
            'isCorrectlyPlacedBridge',
        ).and.returnValue(true);

        const map = {} as MapData;
        service['validateBridges']({ x: 0, y: 0 } as Position, map);

        expect(service['validationErrors'].bridge.isValid).toBeFalse();
        expect(service['validationErrors'].bridge.errors).toContain(
            jasmine.objectContaining({
                x: 0,
                y: 0,
                errorCode: ErrorCode.BridgeAtEdge,
            }),
        );
        expect(service['isOnMapEdge']).toHaveBeenCalledWith({ x: 0, y: 0 }, map);
        expect(service['isCorrectlyPlacedBridge']).toHaveBeenCalledTimes(0);
    });

    it('validateBridges should add an error if isCorrectlyPlacedBridge returns false', () => {
        spyOn(service as unknown as { isOnMapEdge: (x: number, y: number, map: MapData) => boolean }, 'isOnMapEdge').and.returnValue(false);
        spyOn(
            service as unknown as { isCorrectlyPlacedBridge: (x: number, y: number, map: MapData) => boolean },
            'isCorrectlyPlacedBridge',
        ).and.returnValue(false);

        const map = {} as MapData;
        service['validateBridges']({ x: 0, y: 0 } as Position, map);

        expect(service['validationErrors'].bridge.isValid).toBeFalse();
        expect(service['validationErrors'].bridge.errors).toContain(
            jasmine.objectContaining({
                x: 0,
                y: 0,
                errorCode: ErrorCode.BridgeNotBetweenWalls,
            }),
        );
        expect(service['isOnMapEdge']).toHaveBeenCalledWith({ x: 0, y: 0 }, map);
        expect(service['isCorrectlyPlacedBridge']).toHaveBeenCalledWith({ x: 0, y: 0 }, map);
    });

    it('isBridge should validate if a tile is a bridge', () => {
        let tileType = TileType.Bridge;

        expect(service['isBridge'](tileType)).toBeTrue();

        tileType = TileType.BrokenBridge;
        expect(service['isBridge'](tileType)).toBeTrue();

        tileType = TileType.Water;
        expect(service['isBridge'](tileType)).toBeFalse();
    });

    it('isOnMapEdge should return true if the tile is on the edge of the map', () => {
        const map = {
            tiles: [
                [{}, {}, {}],
                [{}, {}, {}],
                [{}, {}, {}],
            ],
        } as MapData;
        const mapLength = 3;

        for (let i = 0; i < mapLength; i++) {
            for (let z = 0; z < mapLength; z++) {
                const position = { x: i, y: z };

                if (i === 1 && z === 1) {
                    expect(service['isOnMapEdge'](position, map)).toBeFalse();
                } else {
                    expect(service['isOnMapEdge'](position, map)).toBeTrue();
                }
            }
        }
    });

    // describe('isCorrectlyPlacedBridge', () => {
    //     beforeEach(() => {
    //         spyOn(
    //             service as unknown as { canTraverseTile: (tileType: TileType, isBridgeTraversable: boolean) => boolean },
    //             'canTraverseTile',
    //         ).and.callFake((tileType) => {
    //             return tileType === TileType.Grass || tileType === TileType.Path;
    //         });
    //     });

    //     it('isCorrectlyPlacedBridge should return true if the bridge is between horizontal water tiles with accessible adjacent tiles', () => {
    //         const map = {
    //             tiles: [
    //                 [TileType.Grass, TileType.Grass, TileType.Grass],
    //                 [TileType.Water, TileType.Bridge, TileType.Water],
    //                 [TileType.Grass, TileType.Grass, TileType.Grass],
    //             ],
    //         } as MapData;

    //         expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeTrue();
    //     });

    //     it('isCorrectlyPlacedBridge should return true if the bridge is between vertical water tiles with accessible adjacent tiles', () => {
    //         const map = {
    //             tiles: [
    //                 [TileType.Grass, TileType.Water, TileType.Grass],
    //                 [TileType.Grass, TileType.Bridge, TileType.Grass],
    //                 [TileType.Grass, TileType.Water, TileType.Grass],
    //             ],
    //         } as MapData;

    //         expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeTrue();
    //     });

    //     it('isCorrectlyPlacedBridge should return false if the bridge is not between horizontal water tiles', () => {
    //         const map = {
    //             tiles: [
    //                 [TileType.Grass, TileType.Grass, TileType.Grass],
    //                 [TileType.Water, TileType.Bridge, TileType.Grass],
    //                 [TileType.Grass, TileType.Grass, TileType.Grass],
    //             ],
    //         } as MapData;

    //         expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeFalse();
    //     });

    //     it('isCorrectlyPlacedBridge should return false if the bridge is not between vertical water tiles', () => {
    //         const map = {
    //             tiles: [
    //                 [TileType.Grass, TileType.Water, TileType.Grass],
    //                 [TileType.Grass, TileType.Bridge, TileType.Grass],
    //                 [TileType.Grass, TileType.Grass, TileType.Grass],
    //             ],
    //         } as MapData;

    //         expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeFalse();
    //     });

    //     it('isCorrectlyPlacedBridge should return false if adjacent tiles are not accessible', () => {
    //         const map = {
    //             tiles: [
    //                 [TileType.Water, TileType.Water, TileType.Water],
    //                 [TileType.Water, TileType.Bridge, TileType.Water],
    //                 [TileType.Water, TileType.Water, TileType.Water],
    //             ],
    //         } as MapData;

    //         expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeFalse();
    //     });
    // });
});
