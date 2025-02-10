import { TestBed } from '@angular/core/testing';
import { BoardVisualService } from '@app/services/board-visual/board-visual.service';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { ThumbnailService } from './thumbnail-service';

describe('ThumbnailService', () => {
    let service: ThumbnailService;
    let boardVisualServiceSpy: jasmine.SpyObj<BoardVisualService>;
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
        boardVisualServiceSpy = jasmine.createSpyObj('BoardVisualService', ['getTileImage'], {
            visualMapData: { size: undefined },
        });

        TestBed.configureTestingModule({
            providers: [ThumbnailService, { provide: BoardVisualService, useValue: boardVisualServiceSpy }],
        });

        service = TestBed.inject(ThumbnailService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate a thumbnail with correct dimensions for Small map', async () => {
        mockMap.tiles = Array(MapSize.Small).fill(Array(MapSize.Small).fill(TileType.Grass));

        boardVisualServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/grass.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(boardVisualServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Small * MapSize.Small);
    });

    it('should generate a thumbnail with correct dimensions for Medium map', async () => {
        mockMap.tiles = Array(MapSize.Medium).fill(Array(MapSize.Medium).fill(TileType.Water));

        boardVisualServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/water.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(boardVisualServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Medium * MapSize.Medium);
    });

    it('should generate a thumbnail with correct dimensions for Large map', async () => {
        mockMap.tiles = Array(MapSize.Large).fill(Array(MapSize.Large).fill(TileType.Path));

        boardVisualServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/path.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(boardVisualServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Large * MapSize.Large);
    });

    it('should handle errors when loading an image', async () => {
        mockMap.tiles = Array(MapSize.Small).fill(Array(MapSize.Small).fill(TileType.Grass));

        boardVisualServiceSpy.getTileImage.and.returnValue('/invalid/path/to/image.png');

        spyOn(window, 'Image').and.callFake(() => {
            const img = new Image();
            setTimeout(() => img.onerror && img.onerror(new Event('error')), 0);
            return img;
        });

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(boardVisualServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Small * MapSize.Small);
    });
});
