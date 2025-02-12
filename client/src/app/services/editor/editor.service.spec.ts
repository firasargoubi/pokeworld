import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { ItemType } from '@common/item-type.enum';
import { Subject } from 'rxjs';
import { EditorService } from './editor.service';
import { GameData } from '@common/game-data';

describe('EditorService', () => {
    let editorService: EditorService;
    let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
    let mockGames: GameData[];

    beforeEach(() => {
        mockGames = structuredClone(MOCK_GAMES);
        const gameDataServiceSpyObj = jasmine.createSpyObj('GameDataService', [
            'setGameData',
            'isMapValid',
            'getItemCount',
            'getMapSize',
            'getGameMode',
        ]);
        const gameSaveServiceSpyObj = jasmine.createSpyObj('GameSaveService', ['isNameUnique', 'saveGame']);
        const gameValidationServiceSpyObj = jasmine.createSpyObj('GameValidationService', ['validateGame']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                EditorService,
                { provide: GameDataService, useValue: gameDataServiceSpyObj },
                { provide: GameSaveService, useValue: gameSaveServiceSpyObj },
                { provide: GameValidationService, useValue: gameValidationServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
            ],
        });
        gameDataServiceSpy = TestBed.inject(GameDataService) as jasmine.SpyObj<GameDataService>;
        gameDataServiceSpy.isMapValid.and.returnValue(true);
        gameDataServiceSpy.itemUpdate = new Subject<ItemType | null>();
        editorService = TestBed.inject(EditorService);
    });

    it('should be created', () => {
        expect(editorService).toBeTruthy();
    });

    it('should reset game data when resetButton is called', () => {
        editorService.initialGameData = mockGames[0];
        gameDataServiceSpy.gameData = mockGames[1];

        editorService.resetButton();

        expect(gameDataServiceSpy.setGameData).toHaveBeenCalledWith(editorService.initialGameData);
        expect(gameDataServiceSpy.setGameData.calls.mostRecent().args[0]).toEqual(editorService.initialGameData);
    });

    it('should not refer to the same object for initialGameData and gameData after resetButton is called', () => {
        editorService.initialGameData = mockGames[0];
        gameDataServiceSpy.gameData = mockGames[1];

        editorService.resetButton();

        expect(editorService.gameDataService.gameData).not.toBe(editorService.initialGameData);
    });
});
