import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { PopupService } from '@app/services/popup/popup.service';
import { GameData } from '@common/game-data';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj<GameSaveService>('GameSaveService', ['getAllGames', 'getGame', 'toggleVisibility', 'deleteGame']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);

        gameSaveServiceSpy.getAllGames.and.returnValue(of([]));
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameSaveServiceSpy.toggleVisibility.and.returnValue(of({} as GameData));
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), CommonModule, AdminPageComponent],
            providers: [
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
            ],
        }).compileComponents();

        gameSaveServiceSpy = TestBed.inject(GameSaveService) as jasmine.SpyObj<GameSaveService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call loadGames on init', () => {
        const loadGamesSpy = spyOn(component, 'loadGames');
        component.ngOnInit();
        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should load games successfully', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of(MOCK_GAMES));

        component.loadGames();

        expect(gameSaveServiceSpy.getAllGames).toHaveBeenCalled();
        expect(component.games).toEqual(MOCK_GAMES);
    });

    it('should handle error when loadGames fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));

        component.loadGames();

        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Échec lors du chargement des jeux');
    });

    it('should navigate to edit page when editGame is called', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const setItemSpy = spyOn(sessionStorage, 'setItem');
        const gameId = '123';

        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));

        component.editGame(gameId);

        expect(setItemSpy).toHaveBeenCalledWith('editGameId', gameId);
        expect(navigateSpy).toHaveBeenCalledWith(['/edit']);
    });

    it('should handle error when editGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        component.editGame('invalid-id');

        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith("Ce jeu n'existe plus !");
    });

    it('should toggle visibility successfully', () => {
        const event = { id: '123', isVisible: true };
        component.toggleVisibility(event);
        expect(gameSaveServiceSpy.toggleVisibility).toHaveBeenCalledWith(event.id);
    });

    it('should handle error when toggleVisibility fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.toggleVisibility.and.returnValue(throwError(() => errorResponse));

        component.toggleVisibility({ id: '123', isVisible: true });

        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should add a confirmation message when deleteGame is called', () => {
        component.deleteGame('123', 'Test Game');
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer le jeu : Test Game', true, jasmine.any(Function));
    });

    it('should delete game when confirmation is accepted', () => {
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

        component.deleteGame('123', 'Test Game');

        const deleteAction = popupServiceSpy.showPopup.calls.mostRecent().args[2];
        if (deleteAction) {
            deleteAction();
        }

        expect(gameSaveServiceSpy.deleteGame).toHaveBeenCalledWith('123');
    });

    it('should handle error when deleteGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Delete failed', status: 500 });
        gameSaveServiceSpy.deleteGame.and.returnValue(throwError(() => errorResponse));

        component.deleteGame('123', 'Test Game');

        const deleteAction = popupServiceSpy.showPopup.calls.mostRecent().args[2];
        if (deleteAction) {
            deleteAction();
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

    it('should return the correct background class based on index', () => {
        expect(component.getCardColor(0)).toBe('blue-card');
        expect(component.getCardColor(1)).toBe('green-card');
        expect(component.getCardColor(2)).toBe('pink-card');
    });

    it('should call loadGames when handleNotFoundError is called', () => {
        const loadGamesSpy = spyOn(component, 'loadGames');
        const error = new HttpErrorResponse({ error: 'Game not found', status: 404 });

        component['handleNotFoundError'](error);

        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should navigate to menu', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.navigateToMenu();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should add a message and call loadGames when the error is 404', () => {
        const error = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        const loadGamesSpy = spyOn(component, 'loadGames');
        component['handleNotFoundError'](error);
        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should delete the game and update the games list', () => {
        const initialGames = structuredClone(MOCK_GAMES);
        const gameId = initialGames[0]._id;

        component.games = initialGames;

        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

        component['confirmDeleteGame'](gameId);

        expect(gameSaveServiceSpy.deleteGame).toHaveBeenCalledWith(gameId);

        expect(component.games.length).toBe(initialGames.length - 1);
        expect(component.games.some((game) => game._id === gameId)).toBeFalse();
    });
});
