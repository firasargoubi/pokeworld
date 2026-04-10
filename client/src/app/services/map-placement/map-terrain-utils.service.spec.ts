/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MapPositionUtilsService } from './map-position-utils.service';
import { MapTerrainUtilsService } from './map-terrain-utils.service';

describe('MapTerrainUtilsService', () => {
    let service: MapTerrainUtilsService;
    let positionUtilsSpy: jasmine.SpyObj<MapPositionUtilsService>;

    beforeEach(() => {
        const positionUtilsMock = jasmine.createSpyObj('MapPositionUtilsService', [
            'getAdjacentCardinalPositions',
            'getAdjacentPositions',
            'positionToKey',
            'isGrassTile',
        ]);

        TestBed.configureTestingModule({
            providers: [MapTerrainUtilsService, { provide: MapPositionUtilsService, useValue: positionUtilsMock }],
        });

        service = TestBed.inject(MapTerrainUtilsService);
        positionUtilsSpy = TestBed.inject(MapPositionUtilsService) as jasmine.SpyObj<MapPositionUtilsService>;
    });

    describe('generateTerrainBodies', () => {
        it('should call generateConnectedTerrainBodies and fillRemainingTerrainTiles', () => {
            const grid: TileType[][] = [
                [TileType.Grass, TileType.Grass],
                [TileType.Grass, TileType.Grass],
            ];
            const tileType = TileType.Bush;
            const targetTileCount = 2;
            const useOrganic = true;

            spyOn(service as any, 'generateConnectedTerrainBodies').and.returnValue(1);
            spyOn(service as any, 'fillRemainingTerrainTiles').and.returnValue(2);

            const result = service.generateTerrainBodies(grid, tileType, targetTileCount, useOrganic);

            expect((service as any).generateConnectedTerrainBodies).toHaveBeenCalledWith(
                grid,
                tileType,
                targetTileCount,
                useOrganic,
                jasmine.any(Set),
            );
            expect((service as any).fillRemainingTerrainTiles).toHaveBeenCalledWith(grid, tileType, targetTileCount, 1, jasmine.any(Set));
            expect(result).toBe(2);
        });
    });

    describe('countTerrainTiles', () => {
        it('should count grass tiles correctly', () => {
            const grid: TileType[][] = [
                [TileType.Grass, TileType.Water, TileType.Grass],
                [TileType.Path, TileType.Grass, TileType.Bush],
            ];

            const result = service.countTerrainTiles(grid);
            const nTerrainTiles = 3;

            expect(result).toBe(nTerrainTiles);
        });

        it('should return 0 for empty grid', () => {
            const grid: TileType[][] = [];

            const result = service.countTerrainTiles(grid);

            expect(result).toBe(0);
        });

        it('should return 0 if no grass tiles', () => {
            const grid: TileType[][] = [
                [TileType.Water, TileType.Path],
                [TileType.Bush, TileType.Water],
            ];

            const result = service.countTerrainTiles(grid);

            expect(result).toBe(0);
        });
    });

    describe('isValidPlacementTile', () => {
        it('should delegate to positionUtils.isGrassTile', () => {
            const grid: TileType[][] = [[TileType.Grass]];
            const x = 0;
            const y = 0;
            positionUtilsSpy.isGrassTile.and.returnValue(true);

            const result = (service as any).isValidPlacementTile(grid, x, y);

            expect(positionUtilsSpy.isGrassTile).toHaveBeenCalledWith(grid, x, y);
            expect(result).toBeTrue();
        });

        it('should return false if not grass tile', () => {
            const grid: TileType[][] = [[TileType.Water]];
            const x = 0;
            const y = 0;
            positionUtilsSpy.isGrassTile.and.returnValue(false);

            const result = (service as any).isValidPlacementTile(grid, x, y);

            expect(result).toBeFalse();
        });
    });
});
