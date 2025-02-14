import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/components/header/header.component';
import { ItemComponent } from '@app/components/item/item.component';
import { MapComponent } from '@app/components/map/map.component';
import { EditorService } from '@app/services/editor/editor.service';
import { PopupService } from '@app/services/popup/popup.service';
import { EditPageComponent } from './edit-page.component';

describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let fixture: ComponentFixture<EditPageComponent>;
    let editorServiceSpy: jasmine.SpyObj<EditorService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;

    beforeEach(async () => {
        editorServiceSpy = jasmine.createSpyObj('EditorService', [
            'gameDataService',
            'editorData',
            'redirectToAdminPage',
            'saveButton',
            'resetButton',
            'onMouseDown',
            'onRightClick',
            'onMouseUp',
            'onMouseMove',
            'onMouseOver',
        ]);

        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, HeaderComponent, MapComponent, ItemComponent, EditPageComponent],
            providers: [
                { provide: EditorService, useValue: editorServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component.ngOnInit).toHaveBeenCalled();
    });

    it('should initialize initialGameData on ngOnInit', () => {
        component.ngOnInit();
        expect(editorServiceSpy.initialGameData).toEqual(editorServiceSpy.gameDataService.gameData);
    });
});
