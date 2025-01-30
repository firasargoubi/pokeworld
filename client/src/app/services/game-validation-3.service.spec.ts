import { TestBed } from '@angular/core/testing';
import { ValidationErrors } from '@app/interfaces/game-validation-errors';
import { GameData } from '@common/game-data';
import { MapData } from '@common/map-data';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { GameValidationService } from './game-validation.service';

describe('II-GameValidationService', () => {
    let service: GameValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameValidationService],
        });
        service = TestBed.inject(GameValidationService);
    });

    describe('areAllTilesAccessible', () => {
        beforeEach(() => {
            service['validationErrors'].tilesAccessibility.isValid = true;
            service['tilesCount'] = { nbTerrain: 5, nbWater: 2, nbBridge: 3, nbTilesTotal: 10 };
        });

        it('areAllTilesAccessible should set tilesAccessibility.isValid to true if all terrain tiles are accessible', () => {
            const MAP_LENGTH = 3;
            spyOn(service as unknown as { dfs: (map: MapData, x: number, y: number, visited: boolean[][]) => void }, 'dfs').and.callFake(
                (_map: MapData, _x: number, _y: number, visited: boolean[][]) => {
                    visited.splice(0, visited.length, [false, true, true], [false, true, true], [true, true, true]);
                },
            );

            const map = {
                tiles: Array.from({ length: MAP_LENGTH }, () => Array(MAP_LENGTH).fill({ type: 'Grass' })),
            } as MapData;
            const expectedVisited: boolean[][] = [
                [false, true, true],
                [false, true, true],
                [true, true, true],
            ];

            service['areAllTilesAccessible'](map);

            expect(service['validationErrors'].tilesAccessibility.isValid).toBeTrue();
            expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toEqual(0);
            expect(service['dfs']).toHaveBeenCalledWith(map, 0, 0, expectedVisited);
        });

        it('areAllTilesAccessible should set tilesAccessibility.isValid to false if some terrain tiles are not accessible', () => {
            const MAP_LENGTH = 3;
            spyOn(service as unknown as { dfs: (map: MapData, x: number, y: number, visited: boolean[][]) => void }, 'dfs').and.callFake(
                (_map: MapData, _x: number, _y: number, visited: boolean[][]) => {
                    visited.splice(0, visited.length, [false, false, false], [true, true, true], [true, true, true]);
                },
            );

            const map = {
                tiles: Array.from({ length: MAP_LENGTH }, () => Array(MAP_LENGTH).fill({ type: 'Grass' })),
            } as MapData;
            const expectedVisited: boolean[][] = [
                [false, false, false],
                [true, true, true],
                [true, true, true],
            ];

            service['areAllTilesAccessible'](map);

            expect(service['validationErrors'].tilesAccessibility.isValid).toBeFalse();
            expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toEqual(1);
            expect(service['dfs']).toHaveBeenCalledWith(map, 0, 0, expectedVisited);
        });
    });

    describe('DFS', () => {
        beforeEach(() => {
            spyOn(
                service as unknown as { canTraverseTile: (tileType: TileType, shouldCountBridge: boolean) => boolean },
                'canTraverseTile',
            ).and.callFake((tileType: TileType) => {
                return tileType !== TileType.Water;
            });
        });

        it('dfs should mark all accessible tiles as visited', () => {
            const MAP_LENGTH = 3;
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Grass, TileType.Water],
                    [TileType.Grass, TileType.Grass, TileType.Water],
                    [TileType.Water, TileType.Grass, TileType.Grass],
                ],
            } as MapData;

            const visited = Array.from({ length: MAP_LENGTH }, () => Array(MAP_LENGTH).fill(false));

            service['dfs'](map, 0, 0, visited);

            expect(visited).toEqual([
                [true, true, false],
                [true, true, false],
                [false, true, true],
            ]);
        });

        it('dfs should not mark tiles as visited if they are inaccessible', () => {
            const MAP_LENGTH = 3;
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Water, TileType.Grass],
                    [TileType.Grass, TileType.Water, TileType.Water],
                    [TileType.Water, TileType.Grass, TileType.Grass],
                ],
            } as MapData;

            const visited = Array.from({ length: MAP_LENGTH }, () => Array(MAP_LENGTH).fill(false));

            service['dfs'](map, 0, 0, visited);

            expect(visited).toEqual([
                [true, false, false],
                [true, false, false],
                [false, false, false],
            ]);
        });

        it('dfs should mark all tiles as not visited if they are all inaccessible', () => {
            const MAP_LENGTH = 3;
            const map = {
                tiles: [
                    [TileType.Water, TileType.Water, TileType.Water],
                    [TileType.Water, TileType.Water, TileType.Water],
                    [TileType.Water, TileType.Water, TileType.Water],
                ],
            } as MapData;

            const visited = Array.from({ length: MAP_LENGTH }, () => Array(MAP_LENGTH).fill(false));

            service['dfs'](map, 0, 0, visited);

            expect(visited).toEqual([
                [false, false, false],
                [false, false, false],
                [false, false, false],
            ]);
        });
    });

    describe('handelTiles', () => {
        beforeEach(() => {
            service['tilesCount'] = { nbWater: 0, nbBridge: 0, nbTerrain: 0, nbTilesTotal: 0 };
            spyOn(service as unknown as { isBridge: (tileType: TileType) => boolean }, 'isBridge').and.callFake((tileType: TileType) => {
                return tileType === TileType.Bridge || tileType === TileType.BrokenBridge;
            });

            spyOn(service as unknown as { areBridgeValid: (position: Position, map: MapData) => void }, 'areBridgeValid').and.callFake(() => {
                return true;
            });
        });

        it('handleTiles should increment nbTerrain if the tile is Grass, Bush or a Path.', () => {
            const NB_TERRAIN = 3;
            const map = {
                tiles: [[TileType.Grass, TileType.Path, TileType.Path]],
            } as MapData;

            service['handelTiles']({ x: 0, y: 0 } as Position, map);
            service['handelTiles']({ x: 0, y: 1 } as Position, map);
            service['handelTiles']({ x: 0, y: 2 } as Position, map);

            expect(service['tilesCount'].nbWater).toBe(0);
            expect(service['tilesCount'].nbBridge).toBe(0);
            expect(service['tilesCount'].nbTerrain).toBe(NB_TERRAIN);
        });

        it('handleTiles should increment nbBridge and validate bridges when the tile is a BridgeOpen', () => {
            const map = {
                tiles: [[TileType.Water, TileType.Grass, TileType.Bridge]],
            } as MapData;

            service['handelTiles']({ x: 0, y: 0 } as Position, map);
            service['handelTiles']({ x: 0, y: 1 } as Position, map);
            service['handelTiles']({ x: 0, y: 2 } as Position, map);

            expect(service['tilesCount'].nbWater).toBe(1);
            expect(service['tilesCount'].nbBridge).toBe(1);
            expect(service['tilesCount'].nbTerrain).toBe(1);
            expect(service['areBridgeValid']).toHaveBeenCalledWith({ x: 0, y: 2 }, map);
        });
    });

    describe('validateMap', () => {
        beforeEach(() => {
            spyOn(service as unknown as { handelTiles: (position: Position, map: MapData) => void }, 'handelTiles').and.stub();
            spyOn(service as unknown as { hasValidTerrainCoverage: () => void }, 'hasValidTerrainCoverage').and.stub();
            spyOn(service as unknown as { areAllTilesAccessible: (map: MapData) => void }, 'areAllTilesAccessible').and.stub();
            spyOn(service as unknown as { areSpawnPointsValid: (map: MapData) => void }, 'areSpawnPointsValid').and.stub();
        });

        it('should call handelTiles for each tile with the correct position', () => {
            const TILES_COUNT = 4;
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Water],
                    [TileType.Bridge, TileType.Path],
                ],
            } as MapData;

            service.validateMap(map);

            expect(service['handelTiles']).toHaveBeenCalledTimes(TILES_COUNT);
            expect(service['handelTiles']).toHaveBeenCalledWith({ x: 0, y: 0 }, map);
            expect(service['handelTiles']).toHaveBeenCalledWith({ x: 0, y: 1 }, map);
            expect(service['handelTiles']).toHaveBeenCalledWith({ x: 1, y: 0 }, map);
            expect(service['handelTiles']).toHaveBeenCalledWith({ x: 1, y: 1 }, map);
        });

        it('should call hasValidTerrainCoverage once', () => {
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Water],
                    [TileType.Bridge, TileType.Path],
                ],
            } as MapData;

            service.validateMap(map);

            expect(service['hasValidTerrainCoverage']).toHaveBeenCalledTimes(1);
        });

        it('should call areAllTilesAccessible once with the correct parameter', () => {
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Water],
                    [TileType.Bridge, TileType.Path],
                ],
            } as MapData;

            service.validateMap(map);

            expect(service['areAllTilesAccessible']).toHaveBeenCalledTimes(1);
            expect(service['areAllTilesAccessible']).toHaveBeenCalledWith(map);
        });

        it('should call areSpawnPointsValid once with the correct parameter', () => {
            const map = {
                tiles: [
                    [TileType.Grass, TileType.Water],
                    [TileType.Bridge, TileType.Path],
                ],
            } as MapData;

            service.validateMap(map);

            expect(service['areSpawnPointsValid']).toHaveBeenCalledTimes(1);
            expect(service['areSpawnPointsValid']).toHaveBeenCalledWith(map);
        });
    });

    describe('validateGame', () => {
        const game = {} as GameData;

        beforeEach(() => {
            spyOn(service as unknown as { isNameValid: (game: GameData) => void }, 'isNameValid').and.stub();
            spyOn(service as unknown as { isDescriptionValid: (game: GameData) => void }, 'isDescriptionValid').and.stub();
            spyOn(service as unknown as { isNameDuplicate: (name: string) => boolean }, 'isNameDuplicate').and.returnValue(false);
            spyOn(service as unknown as { validateMap: (map: MapData) => void }, 'validateMap').and.stub();
        });

        it('validateGame should call isNameValid, isDescriptionValid, isNameDuplicate, and validateMap with correct parameters', () => {
            service.validateGame(game);

            expect(service['isNameValid']).toHaveBeenCalledTimes(1);
            expect(service['isNameValid']).toHaveBeenCalledWith(game);

            expect(service['isDescriptionValid']).toHaveBeenCalledTimes(1);
            expect(service['isDescriptionValid']).toHaveBeenCalledWith(game);

            expect(service['isNameDuplicate']).toHaveBeenCalledTimes(1);
            expect(service['isNameDuplicate']).toHaveBeenCalledWith(game.name);

            expect(service['validateMap']).toHaveBeenCalledTimes(1);
            expect(service['validateMap']).toHaveBeenCalledWith(game.mapData);
        });

        it('validateGame should return true if all validation checks pass', () => {
            service['validationErrors'] = {
                name: { isValid: true, errorCode: null },
                description: { isValid: true, errorCode: null },
                terrainCoverage: { isValid: true, coveragePercentage: 100 },
                spawnPoint: { isValid: true, spawnPointMissing: 0 },
                tilesAccessibility: { isValid: true, nonAccessibleTileCount: 0 },
                mode: { isValid: true, errorCode: null },
            } as ValidationErrors;

            service.validateGame(game);

            const result = service.validateGame(game);
            expect(result).toBeTrue();
        });

        it('validateGame should return false if all validation fails', () => {
            service['validationErrors'] = {
                name: { isValid: false, errorCode: null },
                description: { isValid: false, errorCode: null },
                terrainCoverage: { isValid: false, coveragePercentage: 100 },
                spawnPoint: { isValid: false, spawnPointMissing: 0 },
                tilesAccessibility: { isValid: false, nonAccessibleTileCount: 0 },
                mode: { isValid: false, errorCode: null },
            } as ValidationErrors;

            service.validateGame(game);

            const result = service.validateGame(game);
            expect(result).toBeFalse();
        });

        it('validateGame should return false if any validation fails', () => {
            service['validationErrors'] = {
                name: { isValid: true, errorCode: null },
                description: { isValid: true, errorCode: null },
                terrainCoverage: { isValid: true, coveragePercentage: 100 },
                spawnPoint: { isValid: false, spawnPointMissing: 0 },
                tilesAccessibility: { isValid: true, nonAccessibleTileCount: 0 },
                mode: { isValid: false, errorCode: null },
            } as ValidationErrors;

            service.validateGame(game);

            const result = service.validateGame(game);
            expect(result).toBeFalse();
        });
    });
});
