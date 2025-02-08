import { TestBed } from '@angular/core/testing';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { BoardVisualService } from '../board-visual/board-visual.service';
import { ThumbnailService } from './thumbnail-service';

describe('ThumbnailService', () => {
    let service: ThumbnailService;
    let boardVisualServiceSpy: jasmine.SpyObj<BoardVisualService>;

    beforeEach(() => {
        const boardVisualSpy = jasmine.createSpyObj('BoardVisualService', ['getTileImage']);

        TestBed.configureTestingModule({
            providers: [ThumbnailService, { provide: BoardVisualService, useValue: boardVisualSpy }],
        });

        service = TestBed.inject(ThumbnailService);
        boardVisualServiceSpy = TestBed.inject(BoardVisualService) as jasmine.SpyObj<BoardVisualService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate a thumbnail with correct dimensions for Small map', async () => {
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

        boardVisualServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/grass.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(boardVisualServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Small * MapSize.Small);
    });

    it('should generate a thumbnail with correct dimensions for Medium map', async () => {
        const mockMap: MapData = {
            size: MapSize.Small,
            tiles: Array(MapSize.Medium).fill(Array(MapSize.Medium).fill(TileType.Water)),
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
            gameMode: GameMode.CTF,
        };

        boardVisualServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/water.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(boardVisualServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Medium * MapSize.Medium);
    });

    it('should generate a thumbnail with correct dimensions for Large map', async () => {
        const mockMap: MapData = {
            size: MapSize.Large,
            tiles: Array(MapSize.Large).fill(Array(MapSize.Large).fill(TileType.Path)),
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

        boardVisualServiceSpy.getTileImage.and.returnValue('/assets/images/game/tiles/path.png');

        const thumbnail = await service.getThumbnail(mockMap);

        expect(thumbnail).toContain('data:image/png;base64');
        expect(boardVisualServiceSpy.getTileImage).toHaveBeenCalledTimes(MapSize.Large * MapSize.Large);
    });
});
