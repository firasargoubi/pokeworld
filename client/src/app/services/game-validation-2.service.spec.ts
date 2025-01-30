import { TestBed } from '@angular/core/testing';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
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

    describe('areSpawnPointValid', () => {
        it('getRequiredSpawnPoints should return the correct number of spawn points for each size', () => {
            const REQUIRED_SPAWN_POINTS = {
                [MapSize.Small]: 2,
                [MapSize.Medium]: 4,
                [MapSize.Large]: 6,
            };
            expect(service['getRequiredSpawnPoints'](MapSize.Small)).toBe(REQUIRED_SPAWN_POINTS[MapSize.Small]);
            expect(service['getRequiredSpawnPoints'](MapSize.Medium)).toBe(REQUIRED_SPAWN_POINTS[MapSize.Medium]);
            expect(service['getRequiredSpawnPoints'](MapSize.Large)).toBe(REQUIRED_SPAWN_POINTS[MapSize.Large]);
        });

        it('areSpawnPointsValid should set spawnPoint.isValid to false if placedSpawnPoints is less or greater than required', () => {
            const REQUIRED_SPAWN_POINTS_MEDIUM = 4;
            const PLACED_SPAWN_POINTS_TOO_FEW = 2;
            const PLACED_SPAWN_POINTS_TOO_MANY = 6;
            const SPAWN_POINT_DEFICIT = REQUIRED_SPAWN_POINTS_MEDIUM - PLACED_SPAWN_POINTS_TOO_FEW;
            const SPAWN_POINT_EXCESS = PLACED_SPAWN_POINTS_TOO_MANY - REQUIRED_SPAWN_POINTS_MEDIUM;

            spyOn(service as unknown as { getRequiredSpawnPoints: (map: MapData) => number }, 'getRequiredSpawnPoints').and.returnValue(
                REQUIRED_SPAWN_POINTS_MEDIUM,
            );

            spyOn(
                service as unknown as { canTraverseTile: (tileType: TileType, shouldCountBridge: boolean) => boolean },
                'canTraverseTile',
            ).and.returnValue(true);

            let map = {
                size: MapSize.Medium,
                items: {
                    [ItemType.Spawn]: [
                        { x: 0, y: 0 },
                        { x: 0, y: 1 },
                    ],
                },
                tiles: [[TileType.Grass, TileType.Bush]],
            } as MapData;

            service['areSpawnPointsValid'](map);
            expect(service['validationErrors'].spawnPoint.isValid).toBeFalse();
            expect(service['validationErrors'].spawnPoint.spawnPointMissing).toBe(SPAWN_POINT_DEFICIT);
            expect(service['getRequiredSpawnPoints']).toHaveBeenCalledWith(MapSize.Medium);

            expect(service['canTraverseTile']).toHaveBeenCalledTimes(PLACED_SPAWN_POINTS_TOO_FEW);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Grass, false);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Bush, false);

            map = {
                size: MapSize.Medium,
                items: {
                    [ItemType.Spawn]: [
                        { x: 0, y: 0 } as Position,
                        { x: 0, y: 1 } as Position,
                        { x: 0, y: 2 } as Position,
                        { x: 1, y: 0 } as Position,
                        { x: 1, y: 1 } as Position,
                        { x: 1, y: 2 } as Position,
                    ],
                },
                tiles: [
                    [TileType.Grass, TileType.Bush, TileType.Grass],
                    [TileType.Grass, TileType.Grass, TileType.Grass],
                ],
            } as MapData;

            service['areSpawnPointsValid'](map);
            expect(service['validationErrors'].spawnPoint.isValid).toBeFalse();
            expect(service['validationErrors'].spawnPoint.spawnPointMissing).toBe(-SPAWN_POINT_EXCESS);
            expect(service['getRequiredSpawnPoints']).toHaveBeenCalledWith(MapSize.Medium);

            expect(service['canTraverseTile']).toHaveBeenCalledTimes(PLACED_SPAWN_POINTS_TOO_MANY + PLACED_SPAWN_POINTS_TOO_FEW);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Grass, false);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Bush, false);
        });

        it('areSpawnPointsValid should set spawnPoint.isValid to true if placedSpawnPoints is equal to required', () => {
            const REQUIRED_SPAWN_POINTS_MEDIUM = 4;
            spyOn(service as unknown as { getRequiredSpawnPoints: (map: MapData) => number }, 'getRequiredSpawnPoints').and.returnValue(
                REQUIRED_SPAWN_POINTS_MEDIUM,
            );

            spyOn(
                service as unknown as { canTraverseTile: (tileType: TileType, shouldCountBridge: boolean) => boolean },
                'canTraverseTile',
            ).and.returnValue(true);

            const map = {
                size: MapSize.Medium,
                items: {
                    [ItemType.Spawn]: [
                        { x: 0, y: 0 } as Position,
                        { x: 0, y: 1 } as Position,
                        { x: 0, y: 2 } as Position,
                        { x: 1, y: 0 } as Position,
                    ],
                },
                tiles: [
                    [TileType.Grass, TileType.Bush, TileType.Grass],
                    [TileType.Grass, TileType.Grass, TileType.Grass],
                ],
            } as MapData;

            service['areSpawnPointsValid'](map);
            expect(service['validationErrors'].spawnPoint.isValid).toBeTrue();
            expect(service['validationErrors'].spawnPoint.spawnPointMissing).toBe(0);
            expect(service['getRequiredSpawnPoints']).toHaveBeenCalledWith(MapSize.Medium);

            expect(service['canTraverseTile']).toHaveBeenCalledTimes(REQUIRED_SPAWN_POINTS_MEDIUM);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Grass, false);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Bush, false);
        });

        it('areSpawnPointsValid should set spawnPoint.isValid to false if a placedSpawnPoint is placed on a non-traversable tile.', () => {
            const REQUIRED_SPAWN_POINTS_MEDIUM = 4;
            spyOn(service as unknown as { getRequiredSpawnPoints: (map: MapData) => number }, 'getRequiredSpawnPoints').and.returnValue(
                REQUIRED_SPAWN_POINTS_MEDIUM,
            );

            spyOn(
                service as unknown as { canTraverseTile: (tileType: TileType, shouldCountBridge: boolean) => boolean },
                'canTraverseTile',
            ).and.returnValue(false);

            const map = {
                size: MapSize.Medium,
                items: {
                    [ItemType.Spawn]: [
                        { x: 0, y: 0 } as Position,
                        { x: 0, y: 1 } as Position,
                        { x: 0, y: 2 } as Position,
                        { x: 1, y: 0 } as Position,
                    ],
                },
                tiles: [
                    [TileType.Water, TileType.Bridge, TileType.BrokenBridge],
                    [TileType.Water, TileType.Bridge, TileType.BrokenBridge],
                ],
            } as MapData;

            service['areSpawnPointsValid'](map);
            expect(service['validationErrors'].spawnPoint.isValid).toBeFalse();
            expect(service['validationErrors'].spawnPoint.spawnPointMissing).toBe(0);
            expect(service['validationErrors'].spawnPoint.nonAccessibleSpawnPoint.length).toBe(REQUIRED_SPAWN_POINTS_MEDIUM);

            expect(service['getRequiredSpawnPoints']).toHaveBeenCalledWith(MapSize.Medium);

            expect(service['canTraverseTile']).toHaveBeenCalledTimes(REQUIRED_SPAWN_POINTS_MEDIUM);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Water, false);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.Bridge, false);
            expect(service['canTraverseTile']).toHaveBeenCalledWith(TileType.BrokenBridge, false);
        });
    });

    describe('canTraverseTile', () => {
        it('canTraverseTile should return true for tiles that are not water when shouldCountBridge is true', () => {
            const tiles = [TileType.Bush, TileType.Grass, TileType.Path];

            tiles.forEach((tile) => {
                expect(service['canTraverseTile'](tile, true)).toBeTrue();
            });
        });

        it('canTraverseTile should return false for water tiles when shouldCountBridge is true', () => {
            const tileType = TileType.Water;
            expect(service['canTraverseTile'](tileType, true)).toBeFalse();
        });

        it('canTraverseTile should return true for tiles of type Bush, Grass, or Path when shouldCountBridge is false', () => {
            const tiles = [TileType.Bush, TileType.Grass, TileType.Path];

            tiles.forEach((tile) => {
                expect(service['canTraverseTile'](tile, false)).toBeTrue();
            });
        });

        it('canTraverseTile should return false for tiles that are not Bush, Grass, or Path when shouldCountBridge is false', () => {
            const tiles = [TileType.Water, TileType.Bridge, TileType.BrokenBridge];

            tiles.forEach((tile) => {
                expect(service['canTraverseTile'](tile, false)).toBeFalse();
            });
        });
    });
});
