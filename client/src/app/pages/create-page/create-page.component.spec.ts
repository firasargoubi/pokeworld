import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let router: Router;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GameSaveService', ['getAllGames', 'getGame', 'toggleVisibility', 'deleteGame']);
        spy.getAllGames.and.returnValue(of([]));
        spy.getGame.and.returnValue(of({} as GameData));
        spy.toggleVisibility.and.returnValue(of({} as GameData));
        spy.deleteGame.and.returnValue(of(undefined));

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), CreatePageComponent],
            providers: [{ provide: GameSaveService, useValue: spy }],
        }).compileComponents();

        gameSaveServiceSpy = TestBed.inject(GameSaveService) as jasmine.SpyObj<GameSaveService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreatePageComponent);
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

    it('should call handleError when loadGames fails (INTERNAL_ERROR)', () => {
        const error = new HttpErrorResponse({ error: 'Action failed', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => error));
        const expectedMessage = 'Failed to load games. Please try again later.';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const handleErrorSpy = spyOn<any>(component, 'handleError');
        component.loadGames();

        expect(handleErrorSpy).toHaveBeenCalledWith(expectedMessage, error);
        expect(handleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should call snackBar open when handleError is called', () => {
        const snackBarOpenSpy = spyOn(component['snackBar'], 'open');
        const error = new HttpErrorResponse({ error: 'Test error', status: 500 });
        const expectedMessage = `test: ${error.message}`;

        component['handleError']('test', error);
        expect(snackBarOpenSpy).toHaveBeenCalledWith(expectedMessage, 'Close', { duration: 5000 });
    });

    it('should navigate to menu', () => {
        const navigateSpy = spyOn(router, 'navigate');

        component.navigateToMenu();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
});
