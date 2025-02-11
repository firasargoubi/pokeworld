import { TestBed } from '@angular/core/testing';
import { MapService } from '@app/services/map/map.service';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { ThumbnailService } from './thumbnail.service';

describe('ThumbnailService', () => {
    let service: ThumbnailService;
    let mapServiceSpy: jasmine.SpyObj<MapService>;
    const mockMap: MapData = {
        size: MapSize.Small,
        tiles: Array(MapSize.Small).fill(Array(MapSize.Small).fill(TileType.Grass)),
        items: {
            [ItemType.Item1]: [],
            [ItemType.Item2]: [],
            [ItemType.Item3]: [],
            [ItemType.Item4]: [],
            [ItemType.Item5]: [],
            [ItemType.Item6]: [],
            [ItemType.Random]: [],
            [ItemType.Spawn]: [],
            [ItemType.Flag]: [],
        },
        gameMode: GameMode.FFA,
    };

    beforeEach(() => {
        mapServiceSpy = jasmine.createSpyObj('MapService', ['getTileImage'], {
            visualMapData: { size: undefined },
        });

        TestBed.configureTestingModule({
            providers: [ThumbnailService, { provide: MapService, useValue: mapServiceSpy }],
        });

        service = TestBed.inject(ThumbnailService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate a thumbnail with correct dimensions for Small map', async () => {
        mockMap.tiles = Array(MapSize.Small).fill(Array(MapSize.Small).fill(TileType.Grass));

        mapServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/grass.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(mapServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Small * MapSize.Small);
    });

    it('should generate a thumbnail with correct dimensions for Medium map', async () => {
        mockMap.tiles = Array(MapSize.Medium).fill(Array(MapSize.Medium).fill(TileType.Water));

        mapServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/water.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(mapServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Medium * MapSize.Medium);
    });

    it('should generate a thumbnail with correct dimensions for Large map', async () => {
        mockMap.tiles = Array(MapSize.Large).fill(Array(MapSize.Large).fill(TileType.Path));

        mapServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/path.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(mapServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Large * MapSize.Large);
    });

    // it('should load an image successfully', async () => {
    //     const imageUrl = '/assets/images/game/tiles/grass.png';
    //     const x = 0;
    //     const y = 0;

    //     const mockImage = new Image();
    //     spyOnProperty(mockImage, 'src', 'set').and.callFake(() => {
    //         setTimeout(() => mockImage.onload && mockImage.onload(new Event('load')), 0);
    //     });

    //     spyOn(window, 'Image').and.returnValue(mockImage);

    //     const result = await service.loadImage(imageUrl, x, y);

    //     expect(result).not.toBeNull();
    //     expect(result?.[0]).toBeInstanceOf(HTMLImageElement);
    //     expect(result?.[1]).toBe(x);
    //     expect(result?.[2]).toBe(y);
    // });

    // it('should return null if image fails to load', async () => {
    //     const imageUrl = '/assets/images/game/tiles/invalid.png';
    //     const x = 1;
    //     const y = 1;

    //     const mockImage = new Image();
    //     spyOnProperty(mockImage, 'src', 'set').and.callFake(() => {
    //         setTimeout(() => mockImage.onerror && mockImage.onerror(new Event('error')), 0);
    //     });

    //     spyOn(window, 'Image').and.returnValue(mockImage);

    //     const result = await service.loadImage(imageUrl, x, y);

    //     expect(result).toBeNull();
    // });
});
