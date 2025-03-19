import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from '@app/components/map/map.component';
import { MapVisualData } from '@app/interfaces/map-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
import { MapSize } from '@common/interfaces/map-data';
import { TileType } from '@common/interfaces/tile-type.enum';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;
    let mapServiceSpy: jasmine.SpyObj<MapService>;
    let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
    let playSocketsServiceSpy: jasmine.SpyObj<PlaySocketsService>;

    beforeEach(async () => {
        gameDataServiceSpy = jasmine.createSpyObj('GameDataService', ['getTileFromPosition']);
        gameDataServiceSpy.getTileFromPosition.and.returnValue(TileType.Grass);

        const mockVisualMapData: MapVisualData = {
            tiles: [
                [
                    { tile: 'grass0', underlay: null, item: null, player: null, overlay: null },
                    { tile: 'grass1', underlay: null, item: null, player: null, overlay: null },
                ],
                [
                    { tile: 'grass0', underlay: null, item: null, player: null, overlay: null },
                    { tile: 'grass1', underlay: null, item: null, player: null, overlay: null },
                ],
            ],
            size: MapSize.Small,
        };
        mapServiceSpy = jasmine.createSpyObj('MapService', ['getMapTile'], {
            visualMapData: mockVisualMapData,
            gameDataService: gameDataServiceSpy,
        });

        playSocketsServiceSpy = jasmine.createSpyObj('PlaySocketsService', ['setHoverMoves', 'clickTile', 'rightClickTile']);

        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [
                { provide: MapService, useValue: mapServiceSpy },
                { provide: PlaySocketsService, useValue: playSocketsServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle onHover correctly', () => {
        component.isEditor = true;
        component.onHover({ x: 1, y: 1 });
        expect(playSocketsServiceSpy.setHoverMoves).not.toHaveBeenCalled();

        component.isEditor = false;
        component.onHover({ x: -1, y: 3 });
        expect(playSocketsServiceSpy.setHoverMoves).toHaveBeenCalledWith({ x: -1, y: 3 });

        component.isEditor = false;
        component.onHover({ x: 3, y: 1 });
        expect(playSocketsServiceSpy.setHoverMoves).toHaveBeenCalledWith({ x: 3, y: 1 });
    });

    it('should handle clickTile correctly', () => {
        component.isEditor = true;
        component.clickTile({ x: 1, y: 1 });
        expect(playSocketsServiceSpy.clickTile).not.toHaveBeenCalled();

        component.isEditor = false;
        const position = { x: 5, y: 7 };
        component.clickTile(position);
        expect(playSocketsServiceSpy.clickTile).toHaveBeenCalledWith(position);
    });

    it('should handle rightClickTile correctly', () => {
        component.isEditor = true;
        component.rightClickTile(new MouseEvent('click'), { x: 1, y: 1 });
        expect(playSocketsServiceSpy.rightClickTile).not.toHaveBeenCalled();

        component.isEditor = false;
        const position = { x: 5, y: 7 };
        component.rightClickTile(new MouseEvent('click'), position);
        expect(playSocketsServiceSpy.rightClickTile).toHaveBeenCalledWith(position);
    });
});
