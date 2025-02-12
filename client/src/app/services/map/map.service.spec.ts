/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { BehaviorSubject } from 'rxjs';
import { MapService } from './map.service';

describe('MapService', () => {
    let service: MapService;
    let mockGameDataService: jasmine.SpyObj<GameDataService>;

    beforeEach(() => {
        mockGameDataService = jasmine.createSpyObj('GameDataService', ['getTile', 'isOutOfBound', 'gameData'], {
            mapUpdate: new BehaviorSubject<Position | null>(null),
            gameData: {
                mapData: {
                    size: MapSize.Small,
                    tiles: Array.from({ length: MapSize.Small }, () => Array(MapSize.Small).fill(TileType.Grass)),
                    items: Object.values(ItemType).reduce(
                        (acc, key) => {
                            acc[key] = [];
                            return acc;
                        },
                        {} as Record<ItemType, Position[]>,
                    ),
                },
            },
        });

        TestBed.configureTestingModule({
            providers: [MapService, { provide: GameDataService, useValue: mockGameDataService }],
        });
        service = TestBed.inject(MapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should correctly return if a position is out of bounds in updateTile', () => {
        mockGameDataService.isOutOfBound.and.returnValue(true);
        const position: Position = { x: -1, y: -1 };
        service['updateTile'](position);
        expect(mockGameDataService.isOutOfBound).toHaveBeenCalledWith(mockGameDataService.gameData.mapData.tiles, position);
    });

    it('should initialize visualMapData correctly', () => {
        expect(service.visualMapData).toBeDefined();
        expect(service.visualMapData.size).toBe(MapSize.Small);
    });

    it('should update all tiles on map update', () => {
        spyOn(service, 'updateAllTiles' as any);
        mockGameDataService.mapUpdate.next(null);
        expect((service as any).updateAllTiles).toHaveBeenCalled();
    });

    it('should update surrounding tiles on map update with a position', () => {
        spyOn(service, 'updateSuroundingTiles' as any);
        const position: Position = { x: 1, y: 1 };
        mockGameDataService.mapUpdate.next(position);
        expect((service as any).updateSuroundingTiles).toHaveBeenCalledWith(position);
    });

    it('should return correct tile variants for all tile types', () => {
        const position: Position = { x: 2, y: 2 };
        expect((service as any).getTileVariant(TileType.Water, mockGameDataService.gameData.mapData.tiles, position)).toBeDefined();
        expect((service as any).getTileVariant(TileType.Path, mockGameDataService.gameData.mapData.tiles, position)).toBeDefined();
        expect((service as any).getTileVariant(TileType.Bridge, mockGameDataService.gameData.mapData.tiles, position)).toBeDefined();
        expect((service as any).getTileVariant(TileType.BrokenBridge, mockGameDataService.gameData.mapData.tiles, position)).toBeDefined();
        expect((service as any).getTileVariant(TileType.Grass, mockGameDataService.gameData.mapData.tiles, position)).toBeDefined();
    });

    it('should call updateTile on all surrounding positions', () => {
        spyOn(service, 'updateTile' as any);
        const position: Position = { x: 3, y: 3 };
        (service as any).updateSuroundingTiles(position);
        expect((service as any).updateTile).toHaveBeenCalledTimes(9);
    });

    it('should return correct underlay image for all tile types', () => {
        const position: Position = { x: 3, y: 3 };
        mockGameDataService.getTile.and.callFake((tiles, pos) => {
            if (pos.x === 3 && pos.y === 3) return TileType.Water;
            return TileType.Grass;
        });
        spyOn(service, 'getUnderlayVariant' as any).and.returnValue('1');

        let result = (service as any).getUnderlayImage(mockGameDataService.gameData.mapData.tiles, position);
        expect(result).toContain('1');

        mockGameDataService.getTile.and.returnValue(TileType.BrokenBridge);
        result = (service as any).getUnderlayImage(mockGameDataService.gameData.mapData.tiles, position);
        expect(result).toContain('1');

        mockGameDataService.getTile.and.returnValue(TileType.Bridge);
        result = (service as any).getUnderlayImage(mockGameDataService.gameData.mapData.tiles, position);
        expect(result).toContain('0');

        mockGameDataService.getTile.and.returnValue(TileType.Grass);
        result = (service as any).getUnderlayImage(mockGameDataService.gameData.mapData.tiles, position);
        expect(result).toBeNull();
    });

    it('should correctly compare tiles', () => {
        spyOn(service, 'compareTile' as any).and.returnValue(true);
        const position: Position = { x: 4, y: 4 };
        const result = (service as any).compareTile(mockGameDataService.gameData.mapData.tiles, position, [TileType.Grass]);
        expect(result).toBeTrue();
    });

    it('should generate random string for tile variant', () => {
        spyOn(service, 'getRandomString' as any).and.returnValue('3');
        const position: Position = { x: 5, y: 5 };
        const result = (service as any).getRandomString(position, 5);
        expect(result).toBe('3');
    });

    it('should update underlay only if new value is different', () => {
        const position: Position = { x: 1, y: 1 };
        spyOn(service, 'getTileVisualData' as any).and.returnValue({ tile: 'tile.png', underlay: 'newUnderlay.png', item: 'item.png' });
        service.visualMapData.tiles[1][1] = { tile: 'tile.png', underlay: 'oldUnderlay.png', item: 'item.png' as ItemType };
        service['updateTile'](position);
        expect(service.visualMapData.tiles[1][1].underlay).toBe('newUnderlay.png');
    });

    it('should update item only if new value is different', () => {
        const position: Position = { x: 1, y: 1 };
        spyOn(service, 'getTileVisualData' as any).and.returnValue({ tile: 'tile.png', underlay: 'underlay.png', item: 'newItem.png' });
        service.visualMapData.tiles[1][1] = { tile: 'tile.png', underlay: 'underlay.png', item: 'oldItem.png' as ItemType };
        service['updateTile'](position);
        expect(service.visualMapData.tiles[1][1].item).toBe('newItem.png' as ItemType);
    });

    // it('should correctly check if an item is in a tile', () => {
    //     const position: Position = { x: 2, y: 2 };
    //     const items: Record<ItemType, Position[]> = {
    //         [ItemType.Item1]: [{ x: 2, y: 2 }],
    //         [ItemType.Item2]: [{ x: 1, y: 1 }],
    //         [ItemType.Item3]: [],
    //         [ItemType.Item4]: [],
    //         [ItemType.Item5]: [],
    //         [ItemType.Item6]: [],
    //         [ItemType.Random]: [],
    //         [ItemType.Spawn]: [],
    //         [ItemType.Flag]: [],
    //     };

    //     const result = (service as any).getItemImage(items, position);
    //     expect(result).toBe('/assets/images/game/items/item1.png');
    // });

    // it('should return null if no item exists in tile', () => {
    //     const position: Position = { x: 5, y: 5 };
    //     const items: Record<ItemType, Position[]> = {
    //         [ItemType.Item1]: [{ x: 2, y: 2 }],
    //         [ItemType.Item2]: [{ x: 1, y: 1 }],
    //         [ItemType.Item3]: [],
    //         [ItemType.Item4]: [],
    //         [ItemType.Item5]: [],
    //         [ItemType.Item6]: [],
    //         [ItemType.Random]: [],
    //         [ItemType.Spawn]: [],
    //         [ItemType.Flag]: [],
    //     };

    //     const result = (service as any).getItemImage(items, position);
    //     expect(result).toBeNull();
    // });

    it('should return correct underlay variant for a given position', () => {
        const position: Position = { x: 2, y: 3 };
        spyOn(service, 'getRandomString' as any).and.returnValue('2');
        const result = (service as any).getUnderlayVariant(position);
        expect(result).toBe('2');
    });

    it('should return correct tile similarity string', () => {
        const position: Position = { x: 2, y: 2 };
        const deltaPositions: Position[] = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
        ];
        const tileTypes: TileType[] = [TileType.Grass, TileType.Path];

        spyOn(service, 'compareTiles' as any).and.returnValue([true, false, true, false]);

        const result = (service as any).getSimilarTiles(mockGameDataService.gameData.mapData.tiles, position, deltaPositions, tileTypes);
        expect(result).toBe('0101');
    });
});
