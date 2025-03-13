import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_GAME } from '@app/consts/default-game.const';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { EditorService } from '@app/services/editor/editor.service';
import { EditPageComponent } from './edit-page.component';
import { MapComponent } from '@app/components/map/map.component';
import { ItemComponent } from '@app/components/item/item.component';
import { Component } from '@angular/core';
@Component({
    selector: 'app-map',
    standalone: true,
    template: '',
})
class MockMapComponent {}

@Component({
    selector: 'app-item',
    standalone: true,
    template: '',
})
class MockItemComponent {}

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
            imports: [EditPageComponent],
            providers: [{ provide: EditorService, useValue: editorServiceSpy }],
        }).compileComponents();

        TestBed.overrideComponent(EditPageComponent, {
            add: { imports: [MockMapComponent, MockItemComponent] },
            remove: { imports: [MapComponent, ItemComponent] },
        });

        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set initialGameData on ngOnInit', () => {
        component.ngOnInit();
        expect(editorServiceSpy.initialGameData).toEqual(DEFAULT_GAME);
    });
});
