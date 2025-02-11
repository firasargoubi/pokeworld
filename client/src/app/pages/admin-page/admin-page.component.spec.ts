import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GameSaveService', ['getAllGames', 'getGame', 'toggleVisibility', 'deleteGame']);
        spy.getAllGames.and.returnValue(of([]));
        spy.getGame.and.returnValue(of({} as GameData));
        spy.toggleVisibility.and.returnValue(of({} as GameData));
        spy.deleteGame.and.returnValue(of(undefined));

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), AdminPageComponent],
            providers: [{ provide: GameSaveService, useValue: spy }],
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

    it('should load games when loadGames is called', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of(MOCK_GAMES));

        component.loadGames();

        expect(gameSaveServiceSpy.getAllGames).toHaveBeenCalled();
        expect(component.games).toEqual(MOCK_GAMES);
    });

    it('should navigate to edit page and store game id in sessionStorage when editGame is called', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const setItemSpy = spyOn(sessionStorage, 'setItem');
        const gameId = '123';

        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        component.editGame(gameId);

        expect(setItemSpy).toHaveBeenCalledWith('editGameId', gameId);
        expect(navigateSpy).toHaveBeenCalledWith(['/edit']);
    });

    it('should toggle visibility when toggleVisibility is called', () => {
        const toggleVisibilitySpy = gameSaveServiceSpy.toggleVisibility;
        const event = { id: '123', isVisible: true };

        component.toggleVisibility(event);

        expect(toggleVisibilitySpy).toHaveBeenCalledWith(event.id);
    });

    it('should delete game when deleteGame is called', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of(MOCK_GAMES));
        gameSaveServiceSpy.deleteGame.and.returnValue(of(undefined));

        component.ngOnInit();

        component.deleteGame(MOCK_GAMES[0]._id);

        expect(gameSaveServiceSpy.deleteGame).toHaveBeenCalledWith(MOCK_GAMES[0]._id);

        expect(component.games.length).toBe(1);
        expect(component.games[0]._id).toBe(MOCK_GAMES[1]._id);
    });

    it('should return the correct background class based on index', () => {
        const testCases = [
            { index: 0, expected: 'blue-card' },
            { index: 1, expected: 'green-card' },
            { index: 2, expected: 'pink-card' },
        ];

        testCases.forEach(({ index, expected }) => {
            expect(component.getCardColor(index)).toBe(expected);
        });
    });

    it('should call loadGames when handleNotFoundError is called', () => {
        const loadGamesSpy = spyOn(component, 'loadGames');

        const error = new HttpErrorResponse({ error: 'Game not found', status: 404 });

        component['handleNotFoundError'](error);

        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should toggle isCreationMode on onCreateGame', () => {
        expect(component.isCreationMode).toBeFalse();
        component.onCreateGame();
        expect(component.isCreationMode).toBeTrue();
        component.onCreateGame();
        expect(component.isCreationMode).toBeFalse();
    });

    it('should add error to errors array on handleError', () => {
        component.errors = [];
        const error = new HttpErrorResponse({ error: 'Test error', status: 500 });
        component['handleError'](error);
        expect(component.errors.length).toBe(1);
    });

    it('should remove error from array on popup close', () => {
        component.errors = [new Error('Error 1'), new Error('Error 2')];
        component.removeError(0);
        expect(component.errors.length).toBe(1);
        expect(component.errors[0].message).toBe('Error 2');
    });

    it('should display multiple popups for multiple errors', () => {
        component.errors = [new Error('Error 1'), new Error('Error 2')];
        fixture.detectChanges();

        const popups = fixture.nativeElement.querySelectorAll('app-warning-confirmation-popup');
        expect(popups.length).toBe(2);
    });

    it('should navigate to menu', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.navigateToMenu();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should close popup when X is clicked', () => {
        component.errors = [new Error('Test error')];
        fixture.detectChanges();

        spyOn(component, 'removeError');
        const button = fixture.nativeElement.querySelector('.card-button');
        button.click();

        expect(component.removeError).toHaveBeenCalledWith(0);
    });

    it('should add error when loadGames fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));

        component.loadGames();

        expect(component.errors.length).toBe(1);
    });
    it('should add error when editGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Not Found', status: 404 });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        component.editGame('invalid-id');

        expect(component.errors.length).toBe(1);
        expect(component.errors[0].message).toBe("Ce jeu n'existe plus !");
    });
    it('should add error when toggleVisibility fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Server error', status: 500 });
        gameSaveServiceSpy.toggleVisibility.and.returnValue(throwError(() => errorResponse));

        component.toggleVisibility({ id: '123', isVisible: true });

        expect(component.errors.length).toBe(1);
    });
    it('should add error when deleteGame fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Delete failed', status: 500 });
        gameSaveServiceSpy.deleteGame.and.returnValue(throwError(() => errorResponse));

        component.deleteGame('123');

        expect(component.errors.length).toBe(1);
    });
});
