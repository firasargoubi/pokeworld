/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Structure } from '@app/interfaces/map-structures';
import { EditorService } from '@app/services/editor/editor.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapPositionUtilsService } from '@app/services/map-placement/map-position-utils.service';
import { MAX_ITEM_COUNT } from '@common/consts/item-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { MapItemPlacerService } from './map-item-placer.service';

describe('MapItemPlacerService', () => {
    let service: MapItemPlacerService;
    let editorServiceSpy: jasmine.SpyObj<EditorService>;
    let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
    let positionUtilsSpy: jasmine.SpyObj<MapPositionUtilsService>;

    beforeEach(() => {
        const editorSpy = jasmine.createSpyObj('EditorService', ['placeItem', 'resetLastPicked', 'getRemainingItemCount']);
        const gameDataSpy = jasmine.createSpyObj('GameDataService', ['getGameMode'], {
            gameData: {
                mapData: {
                    items: {
                        [ItemType.Spawn]: [],
                        [ItemType.Flag]: [],
                        [ItemType.Random]: [],
                    },
                },
            },
            mapUpdate: jasmine.createSpyObj('Subject', ['next']),
            itemUpdate: jasmine.createSpyObj('Subject', ['next']),
        });
        const positionUtilsSpyObj = jasmine.createSpyObj('MapPositionUtilsService', [
            'positionToKey',
            'findRandomUnplacedPosition',
            'isValidTerrainTile',
            'hasMinimumDistance',
            'isPositionInStructureInterior',
        ]);

        TestBed.configureTestingModule({
            providers: [
                MapItemPlacerService,
                { provide: EditorService, useValue: editorSpy },
                { provide: GameDataService, useValue: gameDataSpy },
                { provide: MapPositionUtilsService, useValue: positionUtilsSpyObj },
            ],
        });

        service = TestBed.inject(MapItemPlacerService);
        editorServiceSpy = TestBed.inject(EditorService) as jasmine.SpyObj<EditorService>;
        gameDataServiceSpy = TestBed.inject(GameDataService) as jasmine.SpyObj<GameDataService>;
        positionUtilsSpy = TestBed.inject(MapPositionUtilsService) as jasmine.SpyObj<MapPositionUtilsService>;
    });

    describe('placeItems', () => {
        it('should call clearAllItems, placeItemsInStructures, placeSpawnItems, placeRemainingItems, and emit updates', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const size = MapSize.Small;
            const gameMode = GameMode.FFA;
            const structures: Structure[] = [];

            spyOn(service as any, 'clearAllItems');
            spyOn(service as any, 'placeItemsInStructures');
            spyOn(service as any, 'placeSpawnItems');
            spyOn(service as any, 'placeRemainingItems');

            service.placeItems(tiles, size, gameMode, structures);

            expect((service as any).clearAllItems).toHaveBeenCalled();
            expect((service as any).placeItemsInStructures).toHaveBeenCalledWith(structures, jasmine.any(Set));
            expect((service as any).placeSpawnItems).toHaveBeenCalledWith(tiles, size, structures, jasmine.any(Set));
            expect((service as any).placeRemainingItems).toHaveBeenCalledWith(tiles, size as number, jasmine.any(Set), structures);
            expect(gameDataServiceSpy.mapUpdate.next).toHaveBeenCalledWith(null);
            expect(gameDataServiceSpy.itemUpdate.next).toHaveBeenCalledWith(null);
        });
    });

    describe('clearAllItems', () => {
        it('should clear all items and reset last picked', () => {
            (service as any).clearAllItems();

            expect(gameDataServiceSpy.gameData.mapData.items[ItemType.Spawn]).toEqual([]);
            expect(gameDataServiceSpy.gameData.mapData.items[ItemType.Flag]).toEqual([]);
            expect(gameDataServiceSpy.gameData.mapData.items[ItemType.Random]).toEqual([]);
            expect(editorServiceSpy.resetLastPicked).toHaveBeenCalled();
        });
    });

    describe('placeItemsInStructures', () => {
        it('should place items in structure interiors if position found', () => {
            const structures: Structure[] = [{ interior: [{ x: 0, y: 0 }], border: [] }];
            const placedPositions = new Set<string>();
            const interiorPos: Position = { x: 0, y: 0 };
            const itemType = ItemType.Random;

            positionUtilsSpy.findRandomUnplacedPosition.and.returnValue(interiorPos);
            spyOn(service as any, 'getAvailableItemTypes').and.returnValue([itemType]);
            positionUtilsSpy.positionToKey.and.returnValue('0-0');

            (service as any).placeItemsInStructures(structures, placedPositions);

            expect(positionUtilsSpy.findRandomUnplacedPosition).toHaveBeenCalledWith(structures[0].interior, placedPositions);
            expect(editorServiceSpy.placeItem).toHaveBeenCalledWith(itemType, interiorPos);
            expect(placedPositions.has('0-0')).toBeTrue();
        });

        it('should not place item if no position found', () => {
            const structures: Structure[] = [{ interior: [], border: [] }];
            const placedPositions = new Set<string>();

            positionUtilsSpy.findRandomUnplacedPosition.and.returnValue(null);

            (service as any).placeItemsInStructures(structures, placedPositions);

            expect(editorServiceSpy.placeItem).not.toHaveBeenCalled();
        });
    });

    describe('placeSpawnItems', () => {
        it('should place spawn items at generated positions', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const size = MapSize.Small;
            const structures: Structure[] = [];
            const placedPositions = new Set<string>();
            const spawnPositions: Position[] = [{ x: 1, y: 1 }];

            spyOn(service as any, 'generateSpawnPositions').and.returnValue(spawnPositions);
            positionUtilsSpy.positionToKey.and.returnValue('1-1');

            (service as any).placeSpawnItems(tiles, size, structures, placedPositions);

            expect(editorServiceSpy.placeItem).toHaveBeenCalledWith(ItemType.Spawn, spawnPositions[0]);
            expect(placedPositions.has('1-1')).toBeTrue();
        });
    });

    describe('getNumSpawnsForMapSize', () => {
        it('should return the correct number of spawns for map size', () => {
            const size = MapSize.Small;
            const expected = MAX_ITEM_COUNT[size][ItemType.Spawn];

            const result = (service as any).getNumSpawnsForMapSize(size);

            expect(result).toBe(expected);
        });
    });

    describe('isValidSpawnPosition', () => {
        it('should return true for valid spawn position', () => {
            const pos: Position = { x: 1, y: 1 };
            const existingSpawns: Position[] = [];
            const tiles: TileType[][] = [
                [TileType.Grass, TileType.Grass, TileType.Grass],
                [TileType.Grass, TileType.Grass, TileType.Grass],
                [TileType.Grass, TileType.Grass, TileType.Grass],
            ];
            const structures: Structure[] = [];
            const placedPositions = new Set<string>();

            positionUtilsSpy.positionToKey.and.returnValue('1-1');
            positionUtilsSpy.isValidTerrainTile.and.returnValue(true);
            positionUtilsSpy.hasMinimumDistance.and.returnValue(true);
            positionUtilsSpy.isPositionInStructureInterior.and.returnValue(false);

            const result = (service as any).isValidSpawnPosition(pos, existingSpawns, tiles, structures, placedPositions);

            expect(result).toBeTrue();
        });

        it('should return false if not within bounds', () => {
            const pos: Position = { x: 0, y: 0 };
            const existingSpawns: Position[] = [];
            const tiles: TileType[][] = [
                [TileType.Grass, TileType.Grass],
                [TileType.Grass, TileType.Grass],
            ];
            const structures: Structure[] = [];
            const placedPositions = new Set<string>();

            const result = (service as any).isValidSpawnPosition(pos, existingSpawns, tiles, structures, placedPositions);

            expect(result).toBeFalse();
        });
    });

    describe('isWithinSpawnBounds', () => {
        it('should return true if position is within bounds', () => {
            const pos: Position = { x: 1, y: 1 };
            const gridSize = 3;

            const result = (service as any).isWithinSpawnBounds(pos, gridSize);

            expect(result).toBeTrue();
        });

        it('should return false if position is out of bounds', () => {
            const pos: Position = { x: 0, y: 0 };
            const gridSize = 3;

            const result = (service as any).isWithinSpawnBounds(pos, gridSize);

            expect(result).toBeFalse();
        });
    });

    describe('findRandomUnplacedPosition', () => {
        it('should delegate to positionUtils', () => {
            const positions: Position[] = [{ x: 0, y: 0 }];
            const placedPositions = new Set<string>();
            const expectedPos: Position = { x: 0, y: 0 };

            positionUtilsSpy.findRandomUnplacedPosition.and.returnValue(expectedPos);

            const result = (service as any).findRandomUnplacedPosition(positions, placedPositions);

            expect(positionUtilsSpy.findRandomUnplacedPosition).toHaveBeenCalledWith(positions, placedPositions);
            expect(result).toBe(expectedPos);
        });
    });

    describe('isValidItemPosition', () => {
        it('should delegate to positionUtils', () => {
            const tiles: TileType[][] = [[TileType.Grass]];
            const x = 0;
            const y = 0;
            const structures: Structure[] = [];

            positionUtilsSpy.isValidTerrainTile.and.returnValue(true);

            const result = (service as any).isValidItemPosition(tiles, x, y, structures);

            expect(positionUtilsSpy.isValidTerrainTile).toHaveBeenCalledWith(tiles, x, y, structures);
            expect(result).toBeTrue();
        });
    });

    describe('isPositionInStructureInterior', () => {
        it('should delegate to positionUtils', () => {
            const x = 0;
            const y = 0;
            const structures: Structure[] = [];

            positionUtilsSpy.isPositionInStructureInterior.and.returnValue(false);

            const result = (service as any).isPositionInStructureInterior(x, y, structures);

            expect(positionUtilsSpy.isPositionInStructureInterior).toHaveBeenCalledWith(x, y, structures);
            expect(result).toBeFalse();
        });
    });

    describe('getAvailableItemTypes', () => {
        it('should return all item types except Spawn and Flag', () => {
            gameDataServiceSpy.getGameMode.and.returnValue(GameMode.FFA);

            const result = (service as any).getAvailableItemTypes();

            expect(result).toContain(ItemType.Random);
            expect(result).not.toContain(ItemType.Spawn);
        });

        it('should exclude Flag if not CTF mode', () => {
            gameDataServiceSpy.getGameMode.and.returnValue(GameMode.FFA);

            const result = (service as any).getAvailableItemTypes();

            expect(result).not.toContain(ItemType.Flag);
        });

        it('should include Flag if CTF mode', () => {
            gameDataServiceSpy.getGameMode.and.returnValue(GameMode.CTF);

            const result = (service as any).getAvailableItemTypes();

            expect(result).toContain(ItemType.Flag);
        });
    });
});
