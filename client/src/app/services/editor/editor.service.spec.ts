import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { EventProperty } from '@app/interfaces/event-property';
import { ValidationResult } from '@app/interfaces/game-validation-result';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { of, Subject, throwError } from 'rxjs';
import { EditorService } from './editor.service';

describe('EditorService', () => {
    let service: EditorService;
    let gameValidationServiceSpy: jasmine.SpyObj<GameValidationService>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let mockGames: GameData[];

    const mockValidationResult: ValidationResult = {
        name: { isValid: true, errorCode: null },
        description: { isValid: true, errorCode: null },
        terrainCoverage: { isValid: true, coveragePercentage: 100 },
        tilesAccessibility: { isValid: true, nonAccessibleTileCount: 0 },
        items: { isValid: true, misplacedItems: [] },
        bridge: { isValid: true, errors: [] },
        spawnPoint: { isValid: true, errorCode: null },
        mode: { isValid: true, errorCode: null },
    };

    beforeEach(() => {
        const itemUpdateSubject = new Subject<void>();

        gameValidationServiceSpy = jasmine.createSpyObj('GameValidationService', ['validateGame']);
        gameSaveServiceSpy = jasmine.createSpyObj('GameSaveService', ['isNameUnique', 'saveGame']);
        gameDataServiceSpy = jasmine.createSpyObj(
            'GameDataService',
            ['getTileFromPosition', 'addItem', 'isMapValid', 'getItemCount', 'getMapSize', 'getGameMode', 'setGameData'],
            {
                itemUpdate: itemUpdateSubject.asObservable(),
            },
        );
        gameDataServiceSpy.gameData = structuredClone(MOCK_GAMES[0]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        gameValidationServiceSpy.validateGame.and.returnValue(mockValidationResult);
        gameSaveServiceSpy.isNameUnique.and.returnValue(of(true));
        gameSaveServiceSpy.saveGame.and.returnValue(of(MOCK_GAMES[0]));
        gameDataServiceSpy.isMapValid.and.returnValue(true);
        gameDataServiceSpy.getMapSize.and.returnValue(MapSize.Small);
        gameDataServiceSpy.getGameMode.and.returnValue(GameMode.CTF);
        gameDataServiceSpy.getItemCount.and.returnValue(0);

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
        mockGames = structuredClone(MOCK_GAMES);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should add messages correctly', () => {
        service.addMessage('Test error', false);
        expect(service.messages.length).toBe(1);
        expect(service.messages[0].message).toBe('Test error');
    });

    it('should remove messages and execute actions', () => {
        const action = jasmine.createSpy('action');
        service.addMessage('Test', true, action);

        service.removeMessage(0, true);
        expect(service.messages.length).toBe(0);
        expect(action).toHaveBeenCalled();
    });

    it('should handle error when saving', () => {
        const mockErrors: ValidationResult = { ...mockValidationResult, name: { isValid: false, errorCode: ErrorCode.TooLong } };

        gameValidationServiceSpy.validateGame.and.returnValue(mockErrors);
        service.saveButton();

        expect(service.messages.length).toBe(1);
        expect(service.messages[0].message).toContain('Erreurs de validation');
    });

    it('should format validation errors correctly', () => {
        const validationResult: ValidationResult = {
            ...mockValidationResult,
            name: { isValid: false, errorCode: ErrorCode.TooLong },
            terrainCoverage: { isValid: false, coveragePercentage: 20 },
            tilesAccessibility: { isValid: false, nonAccessibleTileCount: 5 },
            items: { isValid: false, misplacedItems: [{ x: 1, y: 1 }] },
            bridge: {
                isValid: false,
                errors: [{ x: 2, y: 2, errorCode: ErrorCode.BridgeAtEdge }],
            },
        };

        const messages = service['getValidationErrorMessage'](validationResult);

        expect(messages).toContain('Erreurs de validation');
        expect(messages).toContain(ErrorCode.TooLong);
        expect(messages).toContain(ErrorCode.TerrainCoverage);
        expect(messages).toContain(ErrorCode.TilesAccessibility);
        expect(messages).toContain(ErrorCode.BridgeAtEdge);
        expect(messages).toContain(ErrorCode.Items);
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
        const error = new Error('Save failed');
        gameSaveServiceSpy.saveGame.and.returnValue(throwError(() => error));
        service['saveGame']();

        expect(service.messages.length).toBe(1);
        expect(service.messages[0].message).toContain('Erreur lors de la sauvegarde');
    });

    it('should prevent item placement on invalid tiles', () => {
        gameDataServiceSpy.getTileFromPosition.and.returnValue(TileType.Water);
        const eventProp = { tilePosition: { x: 0, y: 0 } };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service['dropItem'](eventProp as any);

        expect(gameDataServiceSpy.addItem).not.toHaveBeenCalled();
    });

    it('should reset game data when resetButton is called', () => {
        service.initialGameData = mockGames[0];
        gameDataServiceSpy.gameData = mockGames[1];

        service.resetButton();

        expect(gameDataServiceSpy.setGameData).toHaveBeenCalledWith(service.initialGameData);
        expect(gameDataServiceSpy.setGameData.calls.mostRecent().args[0]).toEqual(service.initialGameData);
    });

    it('should not refer to the same object for initialGameData and gameData after resetButton is called', () => {
        service.initialGameData = mockGames[0];
        gameDataServiceSpy.gameData = mockGames[1];

        service.resetButton();

        expect(service.gameDataService.gameData).not.toBe(service.initialGameData);
    });

    it('should call onClick with isLeftClick = true when left mouse button is clicked', () => {
        const event = new MouseEvent('mousedown', { button: 0 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onclickSpy = spyOn<any>(service, 'onClick');
        service.onMouseDown(event);

        expect(onclickSpy).toHaveBeenCalledWith(event, true);
    });

    it('should call onClick with isLeftClick = false when right mouse button is clicked', () => {
        const event = new MouseEvent('mousedown', { button: 2 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onclickSpy = spyOn<any>(service, 'onClick');
        service.onMouseDown(event);

        expect(onclickSpy).toHaveBeenCalledWith(event, false);
    });

    it('should call preventDefault if tilePosition is defined', () => {
        const event = new MouseEvent('contextmenu');
        const preventDefaultSpy = spyOn(event, 'preventDefault');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue({ tilePosition: { x: 1, y: 1 } });
        service.onRightClick(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not call preventDefault if tilePosition is null', () => {
        const event = new MouseEvent('contextmenu');
        const preventDefaultSpy = spyOn(event, 'preventDefault');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue({ tilePosition: null });
        service.onRightClick(event);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should reset activeTile and activeTilePosition on mouse up', () => {
        service.editorData.activeTile = TileType.Grass;
        service.editorData.activeTilePosition = { x: 5, y: 5 };
        const event = new MouseEvent('mouseup');
        service.onMouseUp(event);

        expect(service.editorData.activeTile).toBeNull();
        expect(service.editorData.activeTilePosition).toEqual({ x: -1, y: -1 });
    });

    it('should call dropItem if activeItem is set', () => {
        service.editorData.activeItem = ItemType.Item1;
        const event = new MouseEvent('mouseup');
        const eventPropertyMock: EventProperty = {
            tilePosition: { x: 2, y: 2 },
            mousePosition: null,
            tile: null,
            item: null,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEventPropertySpy = spyOn<any>(service, 'getEventProperty').and.returnValue(eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dropItemSpy = spyOn<any>(service, 'dropItem');

        service.onMouseUp(event);

        expect(getEventPropertySpy).toHaveBeenCalledWith(event);
        expect(dropItemSpy).toHaveBeenCalledWith(eventPropertyMock);
    });

    it('should update activeItemPosition when activeItem is set', () => {
        service.editorData.activeItem = ItemType.Item1;
        service.editorData.activeItemPosition = { x: 0, y: 0 };
        const event = new MouseEvent('mousemove', { clientX: 10, clientY: 20 });
        service.onMouseMove(event);
        expect(service.editorData.activeItemPosition).toEqual({ x: 10, y: 20 });
    });

    it('should not update activeItemPosition when activeItem is not set', () => {
        service.editorData.activeItem = null;
        service.editorData.activeItemPosition = { x: 5, y: 5 };
        const event = new MouseEvent('mousemove', { clientX: 10, clientY: 20 });
        service.onMouseMove(event);
        expect(service.editorData.activeItemPosition).toEqual({ x: 5, y: 5 });
    });

    it('should not call paintTile if tilePosition is null', () => {
        service.editorData.activeTile = TileType.Grass;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getEventProperty').and.returnValue({ tilePosition: null });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paintTileSpy = spyOn<any>(service, 'paintTile');
        const event = new Event('mouseover');
        service.onMouseOver(event);
        expect(paintTileSpy).not.toHaveBeenCalled();
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

    it('should return correct event properties', () => {
        const mockEvent = {
            target: {
                getAttribute: jasmine.createSpy().and.callFake((attr: string) => {
                    const attributes: Map<string, string> = new Map([
                        ['x', '10'],
                        ['y', '20'],
                        ['tile', 'Path'],
                        ['item', 'Item1'],
                    ]);
                    return attributes.get(attr);
                }),
            },
            clientX: 100,
            clientY: 200,
        } as unknown as MouseEvent;

        const result = service['getEventProperty'](mockEvent);

        expect(result.tilePosition).toEqual({ x: 10, y: 20 });
        expect(result.mousePosition).toEqual({ x: 100, y: 200 });
        expect(result.tile).toEqual(TileType.Path);
        expect(result.item).toEqual(ItemType.Item1);
    });

    it('should handle click on item', () => {
        const event = new MouseEvent('click');
        const eventPropertyMock: EventProperty = {
            tilePosition: null,
            mousePosition: { x: 10, y: 20 },
            tile: null,
            item: ItemType.Item1,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEventPropertySpy = spyOn<any>(service, 'getEventProperty').and.returnValue(eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clickOnItemSpy = spyOn<any>(service, 'clickOnItem');

        service['onClick'](event, true);

        expect(getEventPropertySpy).toHaveBeenCalledWith(event);
        expect(clickOnItemSpy).toHaveBeenCalledWith(eventPropertyMock);
    });

    it('should handle click on tile', () => {
        const event = new MouseEvent('click');
        const eventPropertyMock: EventProperty = {
            tilePosition: null,
            mousePosition: null,
            tile: TileType.Grass,
            item: null,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEventPropertySpy = spyOn<any>(service, 'getEventProperty').and.returnValue(eventPropertyMock);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clickOnTileSpy = spyOn<any>(service, 'clickOnTile');

        service['onClick'](event, true);

        expect(getEventPropertySpy).toHaveBeenCalledWith(event);
        expect(clickOnTileSpy).toHaveBeenCalledWith(TileType.Grass);
    });

    it('should add item when tile is valid', () => {
        const eventProperty: EventProperty = {
            tilePosition: { x: 2, y: 3 },
            mousePosition: null,
            tile: null,
            item: null,
        };

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

    it('should verify map data and navigate to admin if invalid', () => {
        gameDataServiceSpy.isMapValid.and.returnValue(false);
        service['verifyMapData']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should verify map data and not navigate if valid', () => {
        gameDataServiceSpy.isMapValid.and.returnValue(true);
        service['verifyMapData']();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should update all items', () => {
        service['updateAllItems']();
        expect(service.editorData.items.length).toBeGreaterThan(0);
    });

    it('should update item', () => {
        const item = ItemType.Item1;
        service['updateItem'](item);
        expect(service.editorData.items.length).toBeGreaterThan(0);
    });

    it('should get editor items', () => {
        const result = service['getEditorItems']();
        expect(result.length).toBeGreaterThan(0);
    });

    it('should get editor item', () => {
        const result = service['getEditorItem'](ItemType.Item1);
        expect(result.item).toBe(ItemType.Item1);
    });

    it('should return the correct remaining item count', () => {
        const currentItem = 1;

        gameDataServiceSpy.getItemCount.and.returnValue(currentItem);
        gameDataServiceSpy.getMapSize.and.returnValue(MapSize.Small);

        const remainingItemCount = service['getRemainingItemCount'](ItemType.Spawn);

        expect(remainingItemCount).toBe(1);
    });

    it('should return 0 if the item count is equal to the maximum allowed', () => {
        const currentItem = 2;

        gameDataServiceSpy.getItemCount.and.returnValue(currentItem);
        gameDataServiceSpy.getMapSize.and.returnValue(MapSize.Small);

        const remainingItemCount = service['getRemainingItemCount'](ItemType.Spawn);

        expect(remainingItemCount).toBe(0);
    });

    it('should return the correct remaining item count for a larger map size', () => {
        const currentItem = 1;

        gameDataServiceSpy.getItemCount.and.returnValue(currentItem);
        gameDataServiceSpy.getMapSize.and.returnValue(MapSize.Large);

        const remainingItemCount = service['getRemainingItemCount'](ItemType.Spawn);

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(remainingItemCount).toBe(5);
    });
});
