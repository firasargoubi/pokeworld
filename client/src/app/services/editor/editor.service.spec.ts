import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ITEM_IMAGES } from '@app/consts/images.const';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { EventProperty } from '@app/interfaces/event-property';
import { ValidationResult } from '@app/interfaces/game-validation-result';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { of, Subject, throwError } from 'rxjs';
import { EditorService } from './editor.service';
import { EDITOR_ERASE_TILE } from './editor.service.const';
import { MOCK_BAD_MOUSE_EVENT, MOCK_EVENT_PROPERTY, MOCK_MOUSE_EVENT, MOCK_VALIDATION_RESULTS } from './editor.service.spec.const';

describe('EditorService', () => {
    let service: EditorService;
    let gameValidationServiceSpy: jasmine.SpyObj<GameValidationService>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const itemUpdateSubject = new Subject<void>();
        gameValidationServiceSpy = jasmine.createSpyObj('GameValidationService', { validateGame: MOCK_VALIDATION_RESULTS[0] });
        gameSaveServiceSpy = jasmine.createSpyObj('GameSaveService', {
            isNameUnique: of(true),
            saveGame: of(MOCK_GAMES[0]),
        });
        gameDataServiceSpy = jasmine.createSpyObj(
            'GameDataService',
            ['getTileFromPosition', 'addItem', 'editTile', 'setGameData', 'removeItem', 'getItemCount', 'getItem', 'getGameMode', 'isMapValid'],
            {
                itemUpdate: itemUpdateSubject.asObservable(),
                gameData: structuredClone(MOCK_GAMES[0]),
                getMapSize: jasmine.createSpy().and.returnValue(MapSize.Small),
                getGameMode: jasmine.createSpy().and.returnValue(GameMode.CTF),
                getItemCount: jasmine.createSpy().and.returnValue(0),
            },
        );
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                EditorService,
                { provide: GameValidationService, useValue: gameValidationServiceSpy },
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: GameDataService, useValue: gameDataServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });

        service = TestBed.inject(EditorService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    // it('should add messages correctly', () => {
    //     service.addMessage('Test error', false);
    //     expect(service.messages.length).toBe(1);
    //     expect(service.messages[0].message).toBe('Test error');
    // });

    it('should remove messages and execute actions', () => {
        const action = jasmine.createSpy('action');
        service.addMessage('Test', true, action);
        service.removeMessage(0, true);
        expect(service.messages.length).toBe(0);
        expect(action).toHaveBeenCalled();
    });

    it('should handle error when saving', () => {
        const mockErrors: ValidationResult = { ...MOCK_VALIDATION_RESULTS[0], name: { isValid: false, errorCode: ErrorCode.TooLong } };
        gameValidationServiceSpy.validateGame.and.returnValue(mockErrors);
        service.saveButton();
        expect(service.messages.length).toBe(1);
        expect(service.messages[0].message).toContain('Erreurs de validation');
    });

    it('should format validation errors correctly', () => {
        const messages = service['getValidationErrorMessage'](MOCK_VALIDATION_RESULTS[1]);
        const expectedList = [ErrorCode.TooLong, ErrorCode.TerrainCoverage, ErrorCode.TilesAccessibility, ErrorCode.BridgeAtEdge, ErrorCode.Items];
        expectedList.forEach((errorCode) => {
            expect(messages).toContain(errorCode);
        });
    });

    it('should handle correct validation result', () => {
        const validationErrorMessage = service['getValidationErrorMessage'](MOCK_VALIDATION_RESULTS[0]);
        expect(validationErrorMessage).toContain('Aucune erreur de validation');
    });

    it('should handle duplicate name error', () => {
        gameValidationServiceSpy.validateGame.and.returnValue(null);
        gameSaveServiceSpy.isNameUnique.and.returnValue(of(false));
        service.saveButton();
        expect(service.messages.length).toBe(1);
        expect(service.messages[0].message).toContain('déjà utilisé');
    });

    it('should save successfully', () => {
        gameValidationServiceSpy.validateGame.and.returnValue(null);
        gameSaveServiceSpy.isNameUnique.and.returnValue(of(true));
        service.saveButton();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle save errors', () => {
        gameSaveServiceSpy.saveGame.and.returnValue(throwError(() => new Error('Save failed')));
        service['saveGame']();
        expect(service.messages.length).toBe(1);
        expect(service.messages[0].message).toContain('Erreur lors de la sauvegarde');
    });

    it('should prevent save if invalid items', () => {
        gameDataServiceSpy.getTileFromPosition.and.returnValue(TileType.Water);
        const eventProp = { tilePosition: { x: 0, y: 0 } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service['dropItem'](eventProp as any);
        expect(gameDataServiceSpy.addItem).not.toHaveBeenCalled();
    });

    it('should reset game data when resetButton is called', () => {
        service.initialGameData = MOCK_GAMES[0];
        gameDataServiceSpy.gameData = MOCK_GAMES[1];
        service.resetButton();
        expect(service.gameDataService.gameData).not.toBe(service.initialGameData);
    });

    it('should call on click when mouse button is clicked', () => {
        const event = new MouseEvent('mousedown', { button: 0 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onclickSpy = spyOn<any>(service, 'onClick');
        service.onMouseDown(event);
        expect(onclickSpy).toHaveBeenCalledWith(event, true);
    });

    it('should call preventDefault if tilePosition is defined', () => {
        const event = new MouseEvent('contextmenu');
        const preventDefaultSpy = spyOn(event, 'preventDefault');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue({ tilePosition: { x: 1, y: 1 } });
        service.onRightClick(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should reset activeTile and activeTilePosition on mouse up', () => {
        service.editorData.activeTile = TileType.Grass;
        service.editorData.activeTilePosition = { x: 5, y: 5 };
        service.onMouseUp(new MouseEvent('mouseup'));
        expect(service.editorData.activeTile).toBeNull();
        expect(service.editorData.activeTilePosition).toEqual({ x: -1, y: -1 });
    });

    it('should call dropItem if activeItem is set', () => {
        service.editorData.activeItem = ItemType.Item1;
        const eventPropertyMock: EventProperty = { ...MOCK_EVENT_PROPERTY, tilePosition: { x: 2, y: 2 } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue(eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dropItemSpy = spyOn<any>(service, 'dropItem');
        service.onMouseUp(new MouseEvent('mouseup'));
        expect(dropItemSpy).toHaveBeenCalledWith(eventPropertyMock);
    });

    it('should update activeItemPosition when activeItem is set', () => {
        service.editorData.activeItem = ItemType.Item1;
        service.editorData.activeItemPosition = { x: 0, y: 0 };
        const event = new MouseEvent('mousemove', { clientX: 10, clientY: 20 });
        service.onMouseMove(event);
        expect(service.editorData.activeItemPosition).toEqual({ x: 10, y: 20 });
    });

    it('should not call paintTile if tilePosition is null', () => {
        service.editorData.activeTile = TileType.Grass;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue({ tilePosition: null });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paintTileSpy = spyOn<any>(service, 'paintTile');
        service.onMouseOver(new Event('mouseover'));
        expect(paintTileSpy).not.toHaveBeenCalled();
    });

    it('should not call paintTile if activeTile is null', () => {
        service.editorData.activeTile = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEventPropertySpy = spyOn<any>(service, 'getEventProperty');
        service.onMouseOver(new Event('mouseover'));
        expect(getEventPropertySpy).not.toHaveBeenCalled();
    });

    it('should call paintTile if activeTile and tilePosition are valid', () => {
        service.editorData.activeTile = TileType.Grass;
        const mockTilePosition = { x: 2, y: 3 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue({ tilePosition: mockTilePosition });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paintTileSpy = spyOn<any>(service, 'paintTile');
        const event = new Event('mouseover');
        service.onMouseOver(event);
        expect(paintTileSpy).toHaveBeenCalledWith(mockTilePosition);
    });

    it('should set active item correctly', () => {
        const newItem = ItemType.Item1;
        const mousePosition: Position = { x: 100, y: 100 };
        const eventProperty: EventProperty = { ...MOCK_EVENT_PROPERTY, mousePosition };
        service['setActiveItem'](newItem, eventProperty);
        expect(service.editorData.activeItemImage).toEqual(ITEM_IMAGES.get(newItem) as string);
        expect(service.editorData.activeItemPosition).toEqual(mousePosition);
    });

    it('should return correct event properties', () => {
        const result = service['getEventProperty'](MOCK_MOUSE_EVENT);
        expect(result.tilePosition).toEqual({ x: 10, y: 20 });
        expect(result.mousePosition).toEqual({ x: 100, y: 200 });
        expect(result.tile).toEqual(TileType.Path);
        expect(result.item).toEqual(ItemType.Item1);
    });

    it('should return correct event properties', () => {
        const result = service['getEventProperty'](MOCK_BAD_MOUSE_EVENT);
        expect(result.tilePosition).toEqual(null);
        expect(result.mousePosition).toEqual(null);
        expect(result.tile).toEqual(null);
        expect(result.item).toEqual(null);
    });

    it('should handle click on map', () => {
        const eventPropertyMock: EventProperty = { ...MOCK_EVENT_PROPERTY, tilePosition: { x: 1, y: 1 } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue(eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clickOnMapSpy = spyOn<any>(service, 'clickOnMap');
        service['onClick'](new MouseEvent('click'), true);
        expect(clickOnMapSpy).toHaveBeenCalledWith(eventPropertyMock, true);
    });

    it('should handle click on tile', () => {
        const eventPropertyMock: EventProperty = { ...MOCK_EVENT_PROPERTY, tile: TileType.Path };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue(eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clickOnTileSpy = spyOn<any>(service, 'clickOnTile');
        service['onClick'](new MouseEvent('click'), true);
        expect(clickOnTileSpy).toHaveBeenCalledWith(TileType.Path);
    });

    it('should handle click on item', () => {
        const eventPropertyMock: EventProperty = { ...MOCK_EVENT_PROPERTY, item: ItemType.Item1 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue(eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clickOnItemSpy = spyOn<any>(service, 'clickOnItem');
        service['onClick'](new MouseEvent('click'), true);
        expect(clickOnItemSpy).toHaveBeenCalledWith(eventPropertyMock);
    });

    it('should add item when tile is valid', () => {
        const eventProperty: EventProperty = { ...MOCK_EVENT_PROPERTY, tilePosition: { x: 2, y: 3 } };
        gameDataServiceSpy.getTileFromPosition.and.returnValue(TileType.Grass);
        service['dropItem'](eventProperty);
        expect(gameDataServiceSpy.addItem).toHaveBeenCalled();
    });

    it('should handle item update', () => {
        const item = ItemType.Item1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateItemSpy = spyOn<any>(service, 'updateItem');
        service['onItemUpdate'](item);
        expect(updateItemSpy).toHaveBeenCalledWith(item);
    });

    it('should handle item update with null', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateAllItemsSpy = spyOn<any>(service, 'updateAllItems');
        service['onItemUpdate'](null);
        expect(updateAllItemsSpy).toHaveBeenCalled();
    });

    it('should update all items', () => {
        service['updateAllItems']();
        expect(service.editorData.items.length).toBeGreaterThan(0);
    });

    it('should return the correct remaining item count', () => {
        service.editorData.activeItem = ItemType.Spawn;
        gameDataServiceSpy.getItemCount.and.returnValue(2);
        gameDataServiceSpy.getMapSize.and.returnValue(MapSize.Medium);
        const remainingItemCount = service['getRemainingItemCount'](ItemType.Spawn);
        expect(remainingItemCount).toBe(1);
    });

    it('should return the correct flag count in ffa mode', () => {
        gameDataServiceSpy.getGameMode.and.returnValue(GameMode.FFA);
        const maxItemCount = service['getMaxItemCount'](ItemType.Flag);
        expect(maxItemCount).toBe(0);
    });

    it('should not paint tile if painting the same position', () => {
        service.editorData.activeTile = TileType.Path;
        service.editorData.activeTilePosition = { x: 5, y: 5 };
        service['paintTile']({ x: 5, y: 5 });
        expect(gameDataServiceSpy.editTile).not.toHaveBeenCalled();
    });

    it('should not paint tile if already painted', () => {
        service.editorData.activeTile = TileType.Path;
        gameDataServiceSpy.getTileFromPosition.and.returnValue(TileType.Path);
        service['paintTile']({ x: 5, y: 5 });
        expect(gameDataServiceSpy.editTile).not.toHaveBeenCalled();
    });

    it('should replace broken bridge with bridge', () => {
        service.editorData.activeTile = TileType.BrokenBridge;
        gameDataServiceSpy.getTileFromPosition.and.returnValue(TileType.BrokenBridge);
        service['paintTile']({ x: 5, y: 5 });
        expect(gameDataServiceSpy.editTile).toHaveBeenCalledWith(TileType.Bridge, { x: 5, y: 5 });
    });

    it('should pick item correctly', () => {
        const eventPropertyMock: EventProperty = { ...MOCK_EVENT_PROPERTY, tilePosition: { x: 6, y: 6 } };
        gameDataServiceSpy.getItem.and.returnValue(ItemType.Item1);
        service['pickItem'](eventPropertyMock);
        expect(gameDataServiceSpy.removeItem).toHaveBeenCalledWith({ x: 6, y: 6 });
    });

    it('should not set item active if not available', () => {
        const eventPropertyMock: EventProperty = { ...MOCK_EVENT_PROPERTY, item: ItemType.Item1 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getRemainingItemCount').and.returnValue(0);
        service['clickOnItem'](eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(spyOn<any>(service, 'setActiveItem')).not.toHaveBeenCalled();
    });

    it('should set item active if available', () => {
        const eventPropertyMock: EventProperty = { ...MOCK_EVENT_PROPERTY, item: ItemType.Item1 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getRemainingItemCount').and.returnValue(2);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setActiveItemSpy = spyOn<any>(service, 'setActiveItem');
        service['clickOnItem'](eventPropertyMock);
        expect(setActiveItemSpy).toHaveBeenCalled();
    });

    it('should click on map item if item is on tile', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clickOnMapItemSpy = spyOn<any>(service, 'clickOnMapItem');
        gameDataServiceSpy.getItem.and.returnValue(ItemType.Item1);
        service['clickOnMap'](MOCK_EVENT_PROPERTY, true);
        expect(clickOnMapItemSpy).toHaveBeenCalledWith(MOCK_EVENT_PROPERTY, true);
    });

    it('should pick item if left click', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pickItemSpy = spyOn<any>(service, 'pickItem');
        service['clickOnMapItem'](MOCK_EVENT_PROPERTY, true);
        expect(pickItemSpy).toHaveBeenCalledWith(MOCK_EVENT_PROPERTY);
    });

    it('should remove item if right click', () => {
        service['clickOnMapItem'](MOCK_EVENT_PROPERTY, false);
        expect(gameDataServiceSpy.removeItem).toHaveBeenCalledWith(MOCK_EVENT_PROPERTY.tilePosition as Position);
    });

    it('should erase tile if right click', () => {
        const resultSelectedTile = service['getSelectedTile'](false);
        expect(resultSelectedTile).toBe(EDITOR_ERASE_TILE);
    });

    it('should select correct tile', () => {
        service.editorData.tiles[0].isActive = true;
        service['clickOnTile'](TileType.Bush);
        expect(service.editorData.tiles[0].isActive).toBe(false);
        expect(service.editorData.tiles[1].isActive).toBe(true);
    });
});
