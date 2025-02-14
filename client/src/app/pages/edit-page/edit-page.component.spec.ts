import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/components/header/header.component';
import { ItemComponent } from '@app/components/item/item.component';
import { MapComponent } from '@app/components/map/map.component';
import { DEFAULT_GAME } from '@app/consts/default-game';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { EditorService } from '@app/services/editor/editor.service';
import { EditPageComponent } from './edit-page.component';

describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let fixture: ComponentFixture<EditPageComponent>;
    let editorServiceSpy: jasmine.SpyObj<EditorService>;

    beforeEach(async () => {
        editorServiceSpy = jasmine.createSpyObj('EditorService', ['gameDataService', 'editorData', 'redirectToAdminPage']);

        editorServiceSpy.gameDataService.gameData = structuredClone(DEFAULT_GAME);
        editorServiceSpy.editorData = {
            tiles: [],
            items: [],
            selectedTile: null,
            activeTile: null,
            activeTilePosition: { x: -1, y: -1 },
            activeItem: null,
            activeItemImage: EMPTY_IMAGE,
            activeItemPosition: { x: -1, y: -1 },
        };
        editorServiceSpy.gameDataService.getMapSizeString = () => {
            return '';
        };
        editorServiceSpy.gameDataService.getGameModeString = () => {
            return '';
        };

        await TestBed.configureTestingModule({
            imports: [EditPageComponent, HeaderComponent, MapComponent, ItemComponent, FormsModule],
            providers: [{ provide: EditorService, useValue: editorServiceSpy }],
        }).compileComponents();

        editorServiceSpy = TestBed.inject(EditorService) as jasmine.SpyObj<EditorService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
