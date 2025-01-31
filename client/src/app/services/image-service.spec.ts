import { TestBed } from '@angular/core/testing';
import { ItemType } from '@common/item-type.enum';
import { TileType } from '@common/tile-type.enum';
import { ImageService } from './image-service';

describe('ImageService', () => {
    let service: ImageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ImageService],
        });
        service = TestBed.inject(ImageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return correct path for tiles', () => {
        expect(service.getTile(TileType.Grass)).toBe('/assets/images/game/tiles/grass.png');
        expect(service.getTile(TileType.Path)).toBe('/assets/images/game/tiles/path.png');
    });

    it('should return correct path for items', () => {
        expect(service.getItem(ItemType.Flag)).toBe('/assets/images/game/items/flag.png');
        expect(service.getItem(ItemType.Spawn)).toBe('/assets/images/game/items/spawn.png');
    });

    it('should return correct path for tiles with number (decimal case)', () => {
        expect(service.getTileByNumber(TileType.Grass, 2)).toBe('/assets/images/game/tiles/grass-2.png');
    });

    it('should return correct path for tiles with binary formatted number', () => {
        expect(service.getTileByNumber(TileType.Water, 2)).toBe('/assets/images/game/tiles/water-00000010.png');
        expect(service.getTileByNumber(TileType.Path, 15)).toBe('/assets/images/game/tiles/path-00001111.png');
    });
});
