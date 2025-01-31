import { TestBed } from '@angular/core/testing';
import { ErrorCode } from '@app/interfaces/error-code.enum';
// import { BridgeError } from '@app/interfaces/game-validation-errors';
// import { GameData } from '@common/game-data';
// import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
// import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { GameValidationService } from './game-validation.service';

describe('III-GameValidationService', () => {
    let service: GameValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameValidationService],
        });
        service = TestBed.inject(GameValidationService);
    });

    describe('validateFlags', () => {
        beforeEach(() => {
            spyOn(
                service as unknown as { canTraverseTile: (tile: TileType, isBridgeTraversable: boolean) => boolean },
                'canTraverseTile',
            ).and.callFake((tile) => tile !== 'Water');
        });

        it('validateFlags should set mode.isValid to false with errorCode "NO_FLAG" if no flag is placed', () => {
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Grass],
                    [TileType.Grass, TileType.Grass],
                ],
                items: {
                    [ItemType.Flag]: [] as Position[],
                },
            } as MapData;

            service['validateFlags'](map);

            expect(service['validationErrors'].mode.isValid).toBeFalse();
            expect(service['validationErrors'].mode.errorCode).toBe(ErrorCode.NoFlags);
            expect(service['canTraverseTile']).toHaveBeenCalledTimes(0);
        });

        it('should set mode.isValid to false with errorCode "TOO_MANY_FLAGS" if more than one flag is placed', () => {
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Grass],
                    [TileType.Grass, TileType.Grass],
                ],
                items: {
                    [ItemType.Flag]: [
                        { x: 0, y: 0 },
                        { x: 1, y: 1 },
                    ],
                },
            } as MapData;

            service['validateFlags'](map);

            expect(service['validationErrors'].mode.isValid).toBeFalse();
            expect(service['validationErrors'].mode.errorCode).toBe(ErrorCode.TooManyFlags);
            expect(service['canTraverseTile']).toHaveBeenCalledTimes(0);
        });

        it('should set mode.isValid to false with errorCode "MISPLACED_FLAG" if the flag is on an inaccessible tile', () => {
            const map = {
                tiles: [
                    [TileType.Water, TileType.Grass],
                    [TileType.Grass, TileType.Grass],
                ],
                items: {
                    [ItemType.Flag]: [{ x: 0, y: 0 }],
                },
            } as MapData;

            service['validateFlags'](map);

            expect(service['validationErrors'].mode.isValid).toBeFalse();
            expect(service['validationErrors'].mode.errorCode).toBe(ErrorCode.MisplacedFlag);
            expect(service['canTraverseTile']).toHaveBeenCalledTimes(1);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Water, false);
        });

        it('should keep mode.isValid true if exactly one flag is placed on a valid tile', () => {
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Grass],
                    [TileType.Grass, TileType.Grass],
                ],
                items: {
                    [ItemType.Flag]: [{ x: 0, y: 0 }],
                },
            } as MapData;

            service['validateFlags'](map);

            expect(service['validationErrors'].mode.isValid).toBeTrue();
            expect(service['validationErrors'].mode.errorCode).toBeNull();
            expect(service['canTraverseTile']).toHaveBeenCalledTimes(1);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Grass, false);
        });
    });

    // describe('e2e-Validation', () => {
    //     const GRASS = TileType.Grass;
    //     const PATH = TileType.Path;
    //     const BUSH = TileType.Bush;
    //     const WATER = TileType.Water;
    //     const BRIDGE = TileType.Bridge;
    //     const BROKEN_BRIDGE = TileType.BrokenBridge;

    //     it('validateGame should return true if all validation checks pass', () => {
    //         const items = {
    //             [ItemType.Spawn]: [
    //                 { x: 0, y: 0 },
    //                 { x: 1, y: 0 },
    //             ],
    //             [ItemType.Flag]: [{ x: 1, y: 1 }],
    //         } as Record<ItemType, Position[]>;

    //         const map: MapData = {
    //             items,
    //             gameMode: GameMode.CTF,
    //             size: MapSize.Small,
    //             tiles: [
    //                 [GRASS, PATH, GRASS, GRASS, WATER, GRASS, GRASS, GRASS, BUSH, WATER],
    //                 [GRASS, PATH, GRASS, GRASS, WATER, GRASS, GRASS, WATER, BRIDGE, WATER],
    //                 [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, PATH, WATER],
    //                 [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
    //                 [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
    //                 [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, BROKEN_BRIDGE, WATER],
    //                 [BUSH, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
    //                 [GRASS, PATH, GRASS, GRASS, WATER, WATER, GRASS, GRASS, GRASS, WATER],
    //                 [GRASS, BUSH, BUSH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
    //                 [GRASS, PATH, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER],
    //             ],
    //         };

    //         const game = {
    //             name: 'testGame',
    //             description: 'testDescription',
    //             mapData: map,
    //         } as GameData;

    //         service.validateGame(game);
    //         expect(service['validationErrors'].name.isValid).toBeTrue();
    //         expect(service['validationErrors'].description.isValid).toBeTrue();
    //         expect(service['validationErrors'].terrainCoverage.isValid).toBeTrue();
    //         expect(service['validationErrors'].bridge.isValid).toBeTrue();
    //         expect(service['validationErrors'].spawnPoint.isValid).toBeTrue();
    //         expect(service['validationErrors'].tilesAccessibility.isValid).toBeTrue();
    //     });

    //     it('validateGame should return false when name, description, and terrainCoverage are invalid', () => {
    //         const TERRAIN_COVERAGE = 50;
    //         const items = {
    //             [ItemType.Spawn]: [
    //                 { x: 0, y: 9 },
    //                 { x: 1, y: 9 },
    //             ],
    //             [ItemType.Flag]: [{ x: 1, y: 1 }],
    //         } as Record<ItemType, Position[]>;

    //         const map: MapData = {
    //             items,
    //             gameMode: GameMode.CTF,
    //             size: MapSize.Small,
    //             tiles: [
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //                 [WATER, WATER, WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS],
    //             ],
    //         };

    //         const game = {
    //             name: '',
    //             description: '',
    //             mapData: map,
    //         } as GameData;

    //         service.validateGame(game);
    //         expect(service['validationErrors'].name.isValid).toBeFalse();
    //         expect(service['validationErrors'].name.errorCode).toBe(ErrorCode.Empty);

    //         expect(service['validationErrors'].description.isValid).toBeFalse();
    //         expect(service['validationErrors'].description.errorCode).toBe(ErrorCode.Empty);

    //         expect(service['validationErrors'].terrainCoverage.isValid).toBeFalse();
    //         expect(service['validationErrors'].terrainCoverage.coveragePercentage).toBe(TERRAIN_COVERAGE);

    //         expect(service['validationErrors'].bridge.isValid).toBeTrue();
    //         expect(service['validationErrors'].spawnPoint.isValid).toBeTrue();
    //         expect(service['validationErrors'].tilesAccessibility.isValid).toBeTrue();
    //     });

    //     it('validateGame should return false when bridge, spawnPoint, and tilesAccessibility are invalid', () => {
    //         const nonAccessibleTileCount = 14;
    //         const items = {
    //             [ItemType.Spawn]: [
    //                 { x: 0, y: 0 },
    //                 { x: 0, y: 7 },
    //             ],
    //             [ItemType.Flag]: [{ x: 1, y: 1 }],
    //         } as Record<ItemType, Position[]>;

    //         const map: MapData = {
    //             items,
    //             gameMode: GameMode.CTF,
    //             size: MapSize.Small,
    //             tiles: [
    //                 [GRASS, WATER, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS, GRASS],
    //                 [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS, GRASS],
    //                 [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS, GRASS],
    //                 [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, BRIDGE, WATER, GRASS],
    //                 [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
    //                 [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
    //                 [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
    //                 [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
    //                 [WATER, WATER, WATER, GRASS, GRASS, GRASS, GRASS, GRASS, WATER, GRASS],
    //                 [GRASS, GRASS, WATER, BRIDGE, GRASS, GRASS, GRASS, BRIDGE, WATER, GRASS],
    //             ],
    //         };

    //         const game = {
    //             name: 'TestName',
    //             description: 'TestDescription',
    //             mapData: map,
    //         } as GameData;

    //         service.validateGame(game);
    //         expect(service['validationErrors'].name.isValid).toBeTrue();
    //         expect(service['validationErrors'].description.isValid).toBeTrue();
    //         expect(service['validationErrors'].terrainCoverage.isValid).toBeTrue();

    //         expect(service['validationErrors'].tilesAccessibility.isValid).toBeFalse();
    //         expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toEqual(nonAccessibleTileCount);

    //         expect(service['validationErrors'].bridge.isValid).toBeFalse();
    //         expect(service['validationErrors'].bridge.errors).toEqual([
    //             { x: 3, y: 7, errorCode: ErrorCode.BridgeNotBetweenWalls } as BridgeError,
    //             { x: 9, y: 3, errorCode: ErrorCode.BridgeAtEdge } as BridgeError,
    //             { x: 9, y: 7, errorCode: ErrorCode.BridgeAtEdge } as BridgeError,
    //         ]);

    //         expect(service['validationErrors'].spawnPoint.isValid).toBeFalse();
    //         expect(service['validationErrors'].spawnPoint.spawnPointMissing).toBe(0);
    //         expect(service['validationErrors'].spawnPoint.nonAccessibleSpawnPoint).toContain({ x: 0, y: 7 } as Position);
    //     });
    // });
});
