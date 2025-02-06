import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { CreatePageComponent } from './create-page.component';
import { GameService } from '@app/services/game-save/game-save.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameData } from '@common/game-data';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let gameServiceMock: jasmine.SpyObj<GameService>;
    let snackBarMock: jasmine.SpyObj<MatSnackBar>;
    let gameDataServiceMock: jasmine.SpyObj<GameDataService>;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        gameServiceMock = jasmine.createSpyObj('GameService', ['getAllGames', 'getGame']);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [CreatePageComponent],
            providers: [
                { provide: GameService, useValue: gameServiceMock },
                { provide: MatSnackBar, useValue: snackBarMock },
                { provide: GameDataService, useValue: gameDataServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on init', () => {
        const games: GameData[] = [{ id: '1', isVisible: true } as GameData];
        gameServiceMock.getAllGames.and.returnValue(of(games));

        component.ngOnInit();

        expect(component.games).toEqual(games);
    });

    it('should handle error when loading games', () => {
        const errorResponse = new HttpErrorResponse({ error: 'test 404 error', status: 404 });
        gameServiceMock.getAllGames.and.returnValue(throwError(() => errorResponse));

        component.loadGames();

        expect(snackBarMock.open).toHaveBeenCalledWith('test 404 error', 'Close', { duration: 5000 });
    });

    it('should return correct card color', () => {
        expect(component.getCardColor(0)).toBe('blue-card');
        expect(component.getCardColor(1)).toBe('green-card');
        expect(component.getCardColor(2)).toBe('pink-card');
    });

    it('should handle game visibility on join', () => {
        const game: GameData = { id: '1', isVisible: true } as GameData;
        gameServiceMock.getGame.and.returnValue(of(game));

        component.onJoin('1');

        expect(gameDataServiceMock.setGameData).toHaveBeenCalledWith(game);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/player-selection']);
    });

    it('should handle not found error on join', () => {
        const errorResponse = new HttpErrorResponse({ error: 'test 404 error', status: HttpStatusCode.NotFound });
        gameServiceMock.getGame.and.returnValue(throwError(() => errorResponse));

        spyOn(window, 'alert');
        component.onJoin('1');

        expect(window.alert).toHaveBeenCalledWith("Ce jeu n'existe plus !");
        expect(gameServiceMock.getAllGames).toHaveBeenCalled();
    });

    it('should handle game not visible on join', () => {
        const game: GameData = { id: '1', isVisible: false } as GameData;
        gameServiceMock.getGame.and.returnValue(of(game));

        spyOn(window, 'alert');
        component.onJoin('1');

        expect(window.alert).toHaveBeenCalledWith("Ce jeu n'est plus visible !");
        expect(gameServiceMock.getAllGames).toHaveBeenCalled();
    });

    it('should handle error correctly', () => {
        const errorResponse = new HttpErrorResponse({ error: 'test error', status: 500 });

        component['handleError'](errorResponse);

        expect(snackBarMock.open).toHaveBeenCalledWith('test error', 'Close', { duration: 5000 });
    });
});
