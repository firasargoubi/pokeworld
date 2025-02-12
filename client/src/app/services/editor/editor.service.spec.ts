import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { ErrorCode } from '@app/interfaces/error-code.enum';
import { ValidationResult } from '@app/interfaces/game-validation-result';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { GameMode } from '@common/game-mode.enum';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { of, Subject, throwError } from 'rxjs';
import { EditorService } from './editor.service';
import { GameData } from '@common/game-data';

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

    it('should handle validation errors', () => {
        const mockErrors: ValidationResult = { ...mockValidationResult, name: { isValid: false, errorCode: ErrorCode.TooLong } };

        gameValidationServiceSpy.validateGame.and.returnValue(mockErrors);
        service.saveButton();

        expect(service.messages.length).toBe(1);
        expect(service.messages[0].message).toContain('Erreurs de validation');
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
    it('should format validation errors correctly', () => {
        const validationResult: ValidationResult = {
            ...mockValidationResult,
            name: { isValid: false, errorCode: ErrorCode.TooLong },
            terrainCoverage: { isValid: false, coveragePercentage: 20 },
            bridge: {
                isValid: false,
                errors: [{ x: 2, y: 2, errorCode: ErrorCode.BridgeAtEdge }],
            },
        };

        const result = service['getValidationErrorMessage'](validationResult);

        expect(result).toContain('Couverture du terrain');
        expect(result).toContain('Problème de pont');
        expect(result).toContain('dépasse la longueur maximale');
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
});
