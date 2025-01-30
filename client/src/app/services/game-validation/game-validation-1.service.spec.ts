import { TestBed } from '@angular/core/testing';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { GameData } from '@common/game-data';
import { MapData } from '@common/map-data';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { GameValidationService } from './game-validation.service';

describe('I-GameValidationService', () => {
    let service: GameValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameValidationService],
        });
        service = TestBed.inject(GameValidationService);
    });

    describe('areGameNameAndDescriptionValid', () => {
        it('isNameValid should validate a valid game name', () => {
            const game = {
                name: 'ValidGameName',
            } as GameData;

            service['isNameValid'](game);
            expect(service['validationErrors'].name.isValid).toBeTrue();
            expect(service['validationErrors'].name.errorCode).toBeNull();
        });

        it('isNameValid should return false for an empty or excessively long game name', () => {
            let game = {
                name: '',
            } as GameData;

            service['isNameValid'](game);
            expect(service['validationErrors'].name.isValid).toBeFalse();
            expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.Empty);

            const GAME_NAME_TOO_LONG = 400;
            game = {
                name: 'A'.repeat(GAME_NAME_TOO_LONG),
            } as GameData;

            service['isNameValid'](game);
            expect(service['validationErrors'].name.isValid).toBeFalse();
            expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.TooLong);
        });

        it('isDescriptionValid should validate a valid game description', () => {
            const game = {
                description: 'Valid Description',
            } as GameData;

            service['isDescriptionValid'](game);
            expect(service['validationErrors'].description.isValid).toBeTrue();
            expect(service['validationErrors'].name.errorCode).toBeNull();
        });

        it('isDescriptionValid should invalidate an empty or excessively long game description', () => {
            let game = {
                description: '',
            } as GameData;

            service['isDescriptionValid'](game);
            expect(service['validationErrors'].description.isValid).toBeFalse();
            expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.Empty);

            const GAME_DESCRIPTION_TOO_LONG = 400;
            game = {
                description: 'A'.repeat(GAME_DESCRIPTION_TOO_LONG),
            } as GameData;

            service['isDescriptionValid'](game);
            expect(service['validationErrors'].description.isValid).toBeFalse();
            expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.TooLong);
        });
    });

    describe('isCoverageValid', () => {
        it('hasValidTerrainCoverage should validate if terrain coverage is above the threshold and update errorsStruct correctly', () => {
            const PERCENTAGE_FACTOR = 100;

            service['tilesCount'] = { nbTerrain: 4, nbTilesTotal: 4, nbWater: 0, nbBridge: 0 };
            service['hasValidTerrainCoverage']();

            expect(service['validationErrors'].terrainCoverage.isValid).toBeTrue();
            expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(PERCENTAGE_FACTOR);
        });

        it('hasValidTerrainCoverage should invalidate if terrain coverage is below or equal the threshold and update errorsStruct correctly', () => {
            const PERCENTAGE_FACTOR = 100;
            let tilesCount = { nbTerrain: 2, nbTilesTotal: 4, nbWater: 3, nbBridge: 0 };
            let expectedTerrainPercentage = (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * PERCENTAGE_FACTOR;

            service['tilesCount'] = tilesCount;
            service['hasValidTerrainCoverage']();

            expect(service['validationErrors'].terrainCoverage.isValid).toBeFalse();
            expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(expectedTerrainPercentage);

            tilesCount = { nbTerrain: 2, nbTilesTotal: 4, nbWater: 2, nbBridge: 0 };
            expectedTerrainPercentage = (tilesCount.nbTerrain / tilesCount.nbTilesTotal) * PERCENTAGE_FACTOR;

            service['tilesCount'] = { nbTerrain: 2, nbTilesTotal: 4, nbWater: 2, nbBridge: 0 };
            service['hasValidTerrainCoverage']();

            expect(service['validationErrors'].terrainCoverage.isValid).toBeFalse();
            expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(expectedTerrainPercentage);
        });
    });

    describe('areBridgeValid', () => {
        it('areBridgeValid should add an error if isOnMapEdge returns true', () => {
            spyOn(service as unknown as { isOnMapEdge: (position: Position, map: MapData) => boolean }, 'isOnMapEdge').and.returnValue(true);
            spyOn(
                service as unknown as { isCorrectlyPlacedBridge: (position: Position, map: MapData) => boolean },
                'isCorrectlyPlacedBridge',
            ).and.returnValue(true);

            const map = {} as MapData;
            service['areBridgeValid']({ x: 0, y: 0 } as Position, map);

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

        it('areBridgeValid should add an error if isCorrectlyPlacedBridge returns false', () => {
            spyOn(service as unknown as { isOnMapEdge: (x: number, y: number, map: MapData) => boolean }, 'isOnMapEdge').and.returnValue(false);
            spyOn(
                service as unknown as { isCorrectlyPlacedBridge: (x: number, y: number, map: MapData) => boolean },
                'isCorrectlyPlacedBridge',
            ).and.returnValue(false);

            const map = {} as MapData;
            service['areBridgeValid']({ x: 0, y: 0 } as Position, map);

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

        describe('isCorrectlyPlacedBridge', () => {
            beforeEach(() => {
                spyOn(
                    service as unknown as { canTraverseTile: (tileType: TileType, shouldCountBridge: boolean) => boolean },
                    'canTraverseTile',
                ).and.callFake((tileType) => {
                    return tileType === TileType.Grass || tileType === TileType.Path;
                });
            });

            it('isCorrectlyPlacedBridge should return true if the bridge is between horizontal water tiles with accessible adjacent tiles', () => {
                const map = {
                    tiles: [
                        [TileType.Grass, TileType.Grass, TileType.Grass],
                        [TileType.Water, TileType.Bridge, TileType.Water],
                        [TileType.Grass, TileType.Grass, TileType.Grass],
                    ],
                } as MapData;

                expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeTrue();
            });

            it('isCorrectlyPlacedBridge should return true if the bridge is between vertical water tiles with accessible adjacent tiles', () => {
                const map = {
                    tiles: [
                        [TileType.Grass, TileType.Water, TileType.Grass],
                        [TileType.Grass, TileType.Bridge, TileType.Grass],
                        [TileType.Grass, TileType.Water, TileType.Grass],
                    ],
                } as MapData;

                expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeTrue();
            });

            it('isCorrectlyPlacedBridge should return false if the bridge is not between horizontal water tiles', () => {
                const map = {
                    tiles: [
                        [TileType.Grass, TileType.Grass, TileType.Grass],
                        [TileType.Water, TileType.Bridge, TileType.Grass],
                        [TileType.Grass, TileType.Grass, TileType.Grass],
                    ],
                } as MapData;

                expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeFalse();
            });

            it('isCorrectlyPlacedBridge should return false if the bridge is not between vertical water tiles', () => {
                const map = {
                    tiles: [
                        [TileType.Grass, TileType.Water, TileType.Grass],
                        [TileType.Grass, TileType.Bridge, TileType.Grass],
                        [TileType.Grass, TileType.Grass, TileType.Grass],
                    ],
                } as MapData;

                expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeFalse();
            });

            it('isCorrectlyPlacedBridge should return false if adjacent tiles are not accessible', () => {
                const map = {
                    tiles: [
                        [TileType.Water, TileType.Water, TileType.Water],
                        [TileType.Water, TileType.Bridge, TileType.Water],
                        [TileType.Water, TileType.Water, TileType.Water],
                    ],
                } as MapData;

                expect(service['isCorrectlyPlacedBridge']({ x: 1, y: 1 } as Position, map)).toBeFalse();
            });
        });
    });
});
