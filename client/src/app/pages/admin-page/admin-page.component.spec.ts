import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { PopupMessage } from '@app/consts/popup-message.const';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { EditorService } from '@app/services/editor/editor.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { GameState } from '@common/interfaces/game-state.enum';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
@Component({
    selector: 'app-game-card',
    standalone: true,
    template: '',
})
class MockGameCardComponent {}
@Component({
    selector: 'app-chat',
    standalone: true,
    template: '',
})
class MockChatComponent {}

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let mockAudioService: jasmine.SpyObj<AudioService>;
    let i18nServiceSpy: jasmine.SpyObj<I18nService>;
    let gameDataService: jasmine.SpyObj<GameDataService>;
    let editorServiceSpy: jasmine.SpyObj<EditorService>;

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj<GameSaveService>('GameSaveService', ['getAllGames', 'getGame', 'deleteGame']);
        editorServiceSpy = jasmine.createSpyObj('EditorService', ['']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate', 'initialize']);
        i18nServiceSpy.translate.and.callFake((message: string) => message);
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'preloadEffectsForPage', 'playBackgroundMusic']);
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage', 'sendGeneralMessage']);
        gameDataService = jasmine.createSpyObj('GameDataService', ['setGameData', 'isOwner']);
        gameSaveServiceSpy.getAllGames.and.returnValue(of([]));
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [AdminPageComponent, TranslateModule.forRoot()],
            providers: [
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: AudioService, useValue: mockAudioService },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: GameDataService, useValue: gameDataService },
                { provide: I18nService, useValue: i18nServiceSpy },
                { provide: EditorService, useValue: editorServiceSpy },
                { provide: HttpClient, useValue: HttpClient },
            ],
        }).compileComponents();

        TestBed.overrideComponent(AdminPageComponent, {
            add: { imports: [MockGameCardComponent, MockChatComponent] },
            remove: { imports: [GameCardComponent, ChatComponent] },
        });

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call loadGames on init', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const loadGamesSpy = spyOn<any>(component, 'loadGames');
        component.ngOnInit();
        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should load games successfully', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of(structuredClone(MOCK_GAME_DATAS)));

        component['loadGames']();

        expect(gameSaveServiceSpy.getAllGames).toHaveBeenCalled();
        expect(component.games).toEqual(structuredClone(MOCK_GAME_DATAS));
    });

    it('should handle error when loadGames fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));

        component['loadGames']();

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should handle error when deleteGame fails in confirmDeleteGame', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.deleteGame.and.returnValue(throwError(() => errorResponse));

        component['confirmDeleteGame']('');

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should handle error when getGame fails in deleteGame', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        component['deleteGame']('', '');

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should navigate to edit page when editGame is called', () => {
        const gameId = '123';

        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isGameAccessible').and.returnValue(true);

        component.editGame(gameId);

        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Edit]);
    });

    it('should handle error when editGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        component.editGame('invalid-id');

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should show unauthorized popup when editGame is not accessible', () => {
        const gameId = 'unauth';
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isGameAccessible').and.returnValue(false);

        component.editGame(gameId);

        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith({
            message: PopupMessage.UnauthorizedAccessToGame,
            hasCloseButton: true,
            isConfirmation: false,
        });
        expect(routerSpy.navigate).not.toHaveBeenCalledWith([PageEndpoint.Edit]);
    });

    it('should show unauthorized popup when deleteGame is not accessible', () => {
        const gameId = structuredClone(MOCK_GAME_DATAS)[0]._id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isGameAccessible').and.returnValue(false);
        component.deleteGame(gameId, '');
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith({
            message: PopupMessage.UnauthorizedAccessToGame,
            hasCloseButton: true,
            isConfirmation: false,
        });
    });

    it('should add a confirmation message when deleteGame is called', () => {
        component.deleteGame(structuredClone(MOCK_GAME_DATAS)[0]._id, '');
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should delete game when confirmation is accepted', () => {
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isGameAccessible').and.returnValue(true);
        component.deleteGame(structuredClone(MOCK_GAME_DATAS)[0]._id, '');

        const popupMessage = popupServiceSpy.showPopup.calls.mostRecent().args[0];
        if (popupMessage.action) {
            popupMessage.action();
        }

        expect(gameSaveServiceSpy.deleteGame).toHaveBeenCalledWith(structuredClone(MOCK_GAME_DATAS)[0]._id);
    });

    it('should handle error when deleteGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Delete failed', status: 500 });
        gameSaveServiceSpy.deleteGame.and.returnValue(throwError(() => errorResponse));

        component.deleteGame(structuredClone(MOCK_GAME_DATAS)[0]._id, '');

        const popupMessage = popupServiceSpy.showPopup.calls.mostRecent().args[0];
        if (popupMessage.action) {
            popupMessage.action();
        }

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should toggle isCreationMode on onCreateGame', () => {
        expect(component.isCreationMode).toBeFalse();
        component.onCreateGame();
        expect(component.isCreationMode).toBeTrue();
        component.onCreateGame();
        expect(component.isCreationMode).toBeFalse();
    });

    it('handleUnauthorizedAccess should show popup and reload games', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadSpy = spyOn<any>(component, 'loadGames');
        component['handleUnauthorizedAccess']();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith({
            message: PopupMessage.UnauthorizedAccessToGame,
            hasCloseButton: true,
            isConfirmation: false,
        });
        expect(loadSpy).toHaveBeenCalled();
    });

    describe('isGameAccessible', () => {
        it('returns true for public game when user is not owner', () => {
            const game: GameData = structuredClone(MOCK_GAME_DATAS[0]);
            game.gameState = GameState.PUBLIC;
            gameDataService.isOwner.and.returnValue(false);
            expect(component['isGameAccessible'](game)).toBeTrue();
        });

        it('returns false for private-shared game when user is not owner', () => {
            const game: GameData = structuredClone(MOCK_GAME_DATAS[0]);
            game.gameState = GameState.PRIVATE_SHARED;
            gameDataService.isOwner.and.returnValue(false);
            expect(component['isGameAccessible'](game)).toBeFalse();
        });
        it('returns true for any game when user is owner', () => {
            const game: GameData = structuredClone(MOCK_GAME_DATAS[0]);
            game.gameState = GameState.PRIVATE;
            gameDataService.isOwner.and.returnValue(true);
            expect(component['isGameAccessible'](game)).toBeTrue();
        });

        it('returns false for private game when not owner', () => {
            const game: GameData = structuredClone(MOCK_GAME_DATAS[0]);
            game.gameState = GameState.PRIVATE;
            gameDataService.isOwner.and.returnValue(false);
            expect(component['isGameAccessible'](game)).toBeFalse();
        });
    });

    it('should call loadGames when handleNotFoundError is called', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const loadGamesSpy = spyOn<any>(component, 'loadGames');
        const error = new HttpErrorResponse({ error: 'Game not found', status: 404 });

        component['handleNotFoundError'](error);

        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should navigate to menu', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });

    it('should add a message and call loadGames when the error is 404', () => {
        const error = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const loadGamesSpy = spyOn<any>(component, 'loadGames');
        component['handleNotFoundError'](error);
        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should delete the game and update the games list', () => {
        const initialGames = structuredClone(MOCK_GAME_DATAS);
        const gameId = initialGames[0]._id;

        component.games = initialGames;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isGameAccessible').and.returnValue(true);
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));
        component['confirmDeleteGame'](gameId);

        expect(gameSaveServiceSpy.deleteGame).toHaveBeenCalledWith(gameId);
        expect(component.games.length).toBe(initialGames.length - 1);
        expect(component.games.some((game) => game._id === gameId)).toBeFalse();
    });

    it('should hide create Game popup when Escape key is pressed', () => {
        component.isCreationMode = true;
        fixture.detectChanges();
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);

        expect(component.isCreationMode).toBeFalse();
    });
});
