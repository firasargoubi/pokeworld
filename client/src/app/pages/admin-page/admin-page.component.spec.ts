import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj<GameSaveService>('GameSaveService', ['getAllGames', 'getGame', 'toggleVisibility', 'deleteGame']);
        gameSaveServiceSpy.getAllGames.and.returnValue(of());
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameSaveServiceSpy.toggleVisibility.and.returnValue(of({} as GameData));
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [AdminPageComponent],
            providers: [
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
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

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe('Échec lors du chargement des jeux');
    });

    it('should navigate to edit page when editGame is called', () => {
        const gameId = '123';

        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));

        component.editGame(gameId);

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/edit']);
    });

    it('should handle error when editGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        component.editGame('invalid-id');

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe("Ce jeu n'existe plus !");
    });

    it('should toggle visibility successfully', () => {
        const event = { id: '123', isVisible: true };
        component.toggleVisibility(event);
        expect(gameSaveServiceSpy.toggleVisibility).toHaveBeenCalledWith(event.id);
    });

    it('should handle error when toggleVisibility fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.toggleVisibility.and.returnValue(throwError(() => errorResponse));

        component.toggleVisibility({ id: MOCK_GAMES[0]._id, isVisible: true });

        expect(component.messages.length).toBe(1);
    });

    it('should add a confirmation message when deleteGame is called', () => {
        component.deleteGame(MOCK_GAMES[0]._id, '');

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe('Êtes-vous sûr de vouloir supprimer le jeu : ');
        expect(component.messages[0].isConfirmation).toBeTrue();
    });

    it('should delete game when confirmation is accepted', () => {
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

        component.deleteGame(MOCK_GAMES[0]._id, '');
        component.removeMessage(0, true);

        expect(gameSaveServiceSpy.deleteGame).toHaveBeenCalledWith(MOCK_GAMES[0]._id);
    });

    it('should not delete game when confirmation is canceled', () => {
        component.deleteGame(MOCK_GAMES[0]._id, '');

        component.removeMessage(0, false);

        expect(gameSaveServiceSpy.deleteGame).not.toHaveBeenCalled();
        expect(component.messages.length).toBe(0);
    });

    it('should handle error when deleteGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Delete failed', status: 500 });
        gameSaveServiceSpy.deleteGame.and.returnValue(throwError(() => errorResponse));

        component.deleteGame(MOCK_GAMES[0]._id, '');
        component.removeMessage(0, true);

        expect(component.messages.length).toBe(1);
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

    it('should remove message from array on popup close', () => {
        component.messages = [{ message: 'Message 1', isConfirmation: false }];
        component.removeMessage(0, false);
        expect(component.messages.length).toBe(0);
    });

    it('should display multiple popups for multiple messages', () => {
        component.messages = [
            { message: 'Message 1', isConfirmation: false },
            { message: 'Message 2', isConfirmation: false },
        ];
        fixture.detectChanges();

        const popups = fixture.nativeElement.querySelectorAll('app-warning-confirmation-popup');
        expect(popups.length).toBe(2);
    });

    it('should navigate to menu', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should add a message to the messages array', () => {
        component['addMessage']('Test message', false);

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe('Test message');
        expect(component.messages[0].isConfirmation).toBeFalse();
    });

    it('should add a confirmation message with an action', () => {
        const action = () => {
            return;
        };
        component['addMessage']('Confirmation message', true, action);

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe('Confirmation message');
        expect(component.messages[0].isConfirmation).toBeTrue();
        expect(component.messages[0].action).toBe(action);
    });

    it('should add a message when the error is not 404', () => {
        const error = new HttpErrorResponse({ error: 'Server error', status: 500 });
        component['handleNotFoundError'](error);
        expect(component.messages.length).toBe(1);
    });

    it('should add a message and call loadGames when the error is 404', () => {
        const error = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        const loadGamesSpy = spyOn(component, 'loadGames');
        component['handleNotFoundError'](error);
        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe("Ce jeu n'existe plus !");
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

    it('should handle error when deleteGame fails', () => {
        const gameId = MOCK_GAMES[0]._id;
        const errorResponse = new HttpErrorResponse({ error: 'Delete failed', status: 500 });
        gameSaveServiceSpy.deleteGame.and.returnValue(throwError(() => errorResponse));

        component['confirmDeleteGame'](gameId);

        expect(component.messages.length).toBe(1);
    });
    it('should remove the message and execute the action if confirmed', () => {
        const action = jasmine.createSpy('action');
        component.messages = [{ message: 'Test message', isConfirmation: true, action }];

        component.removeMessage(0, true);

        expect(component.messages.length).toBe(0);
        expect(action).toHaveBeenCalled();
    });

    it('should remove the message without executing the action if not confirmed', () => {
        const action = jasmine.createSpy('action');
        component.messages = [{ message: 'Test message', isConfirmation: true, action }];

        component.removeMessage(0, false);

        expect(component.messages.length).toBe(0);
        expect(action).not.toHaveBeenCalled();
    });

    it('should not execute the action if the message is not a confirmation', () => {
        const action = jasmine.createSpy('action');
        component.messages = [{ message: 'Test message', isConfirmation: false, action }];

        component.removeMessage(0, true);

        expect(component.messages.length).toBe(0);
        expect(action).not.toHaveBeenCalled();
    });
});
