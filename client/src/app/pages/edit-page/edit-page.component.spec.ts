import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/components/header/header.component';
import { ItemComponent } from '@app/components/item/item.component';
import { MapComponent } from '@app/components/map/map.component';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { DEFAULT_GAME } from '@app/consts/default-game';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { EditorService } from '@app/services/editor/editor.service';
import { EditPageComponent } from './edit-page.component';

describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let fixture: ComponentFixture<EditPageComponent>;
    let editorServiceSpy: jasmine.SpyObj<EditorService>;

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
        editorServiceSpy.messages = [];
        editorServiceSpy.gameDataService.getMapSizeString = () => {
            return '';
        };
        editorServiceSpy.gameDataService.getGameModeString = () => {
            return '';
        };

        await TestBed.configureTestingModule({
            imports: [FormsModule, HeaderComponent, MapComponent, ItemComponent, WarningConfirmationPopupComponent, EditPageComponent],
            providers: [{ provide: EditorService, useValue: editorServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize initialGameData on ngOnInit', () => {
        component.ngOnInit();
        expect(editorServiceSpy.initialGameData).toEqual(editorServiceSpy.gameDataService.gameData);
    });

    it('should add message correctly', () => {
        const message = 'Test message';
        component.addMessage(message);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message)).toBeTrue();
    });

    it('should not add duplicate messages', () => {
        const message = 'Test message';
        component.addMessage(message);
        component.addMessage(message);
        expect(editorServiceSpy.messages.filter((msg) => msg.message === message).length).toBe(1);
    });

    it('should remove message by index correctly', () => {
        const message = 'Test message';
        component.addMessage(message);
        component.removeMessage(0);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message)).toBeFalse();
    });

    it('should handle warning correctly', () => {
        const message = 'Test message';
        component.handleWarning(true, message);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message)).toBeTrue();

        component.handleWarning(false, message);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message)).toBeFalse();
    });

    it('should handle warning correctly when condition is false', () => {
        const message = 'Test message';
        component.addMessage(message);
        component.handleWarning(false, message);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message)).toBeFalse();
    });

    it('should handle warning correctly when condition is true', () => {
        const message = 'Test message';
        component.handleWarning(true, message);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message)).toBeTrue();
    });

    it('should add confirmation message correctly', () => {
        const message = 'Test confirmation message';
        const action = jasmine.createSpy('action');
        component.addMessage(message, true, action);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message && msg.isConfirmation && msg.action === action)).toBeTrue();
    });

    it('should remove confirmation message and execute action', () => {
        const message = 'Test confirmation message';
        const action = jasmine.createSpy('action');
        component.addMessage(message, true, action);
        component.removeMessage(0);
        expect(editorServiceSpy.messages.some((msg) => msg.message === message)).toBeFalse();
    });
});
