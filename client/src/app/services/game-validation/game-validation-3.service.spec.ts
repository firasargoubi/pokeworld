import { TestBed } from '@angular/core/testing';
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

    describe('validateTilesAccessibility', () => {
        beforeEach(() => {
            service['validationErrors'].tilesAccessibility.isValid = true;
            service['tilesCount'] = { nbTerrain: 5, nbWater: 2, nbBridge: 3, nbTilesTotal: 10 };
        });

        it('validateTilesAccessibility should set tilesAccessibility.isValid to true if all terrain tiles are accessible', () => {
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

            service['validateTilesAccessibility'](map);

            expect(service['validationErrors'].tilesAccessibility.isValid).toBeTrue();
            expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toEqual(0);
            expect(service['dfs']).toHaveBeenCalledWith(map, 0, 0, expectedVisited);
        });

        it('validateTilesAccessibility should set tilesAccessibility.isValid to false if some terrain tiles are not accessible', () => {
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

            service['validateTilesAccessibility'](map);

            expect(service['validationErrors'].tilesAccessibility.isValid).toBeFalse();
            expect(service['validationErrors'].tilesAccessibility.nonAccessibleTileCount).toEqual(1);
            expect(service['dfs']).toHaveBeenCalledWith(map, 0, 0, expectedVisited);
        });
    });

    describe('DFS', () => {
        beforeEach(() => {
            spyOn(
                service as unknown as { canTraverseTile: (tileType: TileType, isBridgeTraversable: boolean) => boolean },
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

    describe('handleTiles', () => {
        beforeEach(() => {
            service['tilesCount'] = { nbWater: 0, nbBridge: 0, nbTerrain: 0, nbTilesTotal: 0 };
            spyOn(service as unknown as { isBridge: (tileType: TileType) => boolean }, 'isBridge').and.callFake((tileType: TileType) => {
                return tileType === TileType.Bridge || tileType === TileType.BrokenBridge;
            });

            spyOn(service as unknown as { validateBridges: (position: Position, map: MapData) => void }, 'validateBridges').and.callFake(() => {
                return true;
            });
        });

        it('handleTiles should increment nbTerrain if the tile is Grass, Bush or a Path.', () => {
            const NB_TERRAIN = 3;
            const map = {
                tiles: [[TileType.Grass, TileType.Path, TileType.Path]],
            } as MapData;

            service['handleTiles']({ x: 0, y: 0 } as Position, map);
            service['handleTiles']({ x: 0, y: 1 } as Position, map);
            service['handleTiles']({ x: 0, y: 2 } as Position, map);

            expect(service['tilesCount'].nbWater).toBe(0);
            expect(service['tilesCount'].nbBridge).toBe(0);
            expect(service['tilesCount'].nbTerrain).toBe(NB_TERRAIN);
        });

        it('handleTiles should increment nbBridge and validate bridges when the tile is a BridgeOpen', () => {
            const map = {
                tiles: [[TileType.Water, TileType.Grass, TileType.Bridge]],
            } as MapData;

            service['handleTiles']({ x: 0, y: 0 } as Position, map);
            service['handleTiles']({ x: 0, y: 1 } as Position, map);
            service['handleTiles']({ x: 0, y: 2 } as Position, map);

            expect(service['tilesCount'].nbWater).toBe(1);
            expect(service['tilesCount'].nbBridge).toBe(1);
            expect(service['tilesCount'].nbTerrain).toBe(1);
            expect(service['validateBridges']).toHaveBeenCalledWith({ x: 0, y: 2 }, map);
        });
    });
});
