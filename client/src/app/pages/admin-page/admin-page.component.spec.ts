import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { VisibilityEvent } from '@app/interfaces/visibility-event';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
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

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj<GameSaveService>('GameSaveService', ['getAllGames', 'getGame', 'toggleVisibility', 'deleteGame']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate']);
        i18nServiceSpy.translate.and.callFake((message: string) => message);
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'preloadEffectsForPage', 'playBackgroundMusic']);
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage', 'sendGeneralMessage']);
        gameSaveServiceSpy.getAllGames.and.returnValue(of([]));
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameSaveServiceSpy.toggleVisibility.and.returnValue(of({} as GameData));
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
                { provide: I18nService, useValue: i18nServiceSpy },
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

    it('should navigate to edit page when editGame is called', () => {
        const gameId = '123';

        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));

        component.editGame(gameId);

        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Edit]);
    });

    it('should handle error when editGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        component.editGame('invalid-id');

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should toggle visibility successfully', () => {
        const event: VisibilityEvent = { id: '123', isVisible: true };
        component.toggleVisibility(event);
        expect(gameSaveServiceSpy.toggleVisibility).toHaveBeenCalledWith(event.id);
    });

    it('should handle error when toggleVisibility fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.toggleVisibility.and.returnValue(throwError(() => errorResponse));

        const event: VisibilityEvent = { id: structuredClone(MOCK_GAME_DATAS)[0]._id, isVisible: true };
        component.toggleVisibility(event);

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should add a confirmation message when deleteGame is called', () => {
        component.deleteGame(structuredClone(MOCK_GAME_DATAS)[0]._id, '');
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should delete game when confirmation is accepted', () => {
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

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
