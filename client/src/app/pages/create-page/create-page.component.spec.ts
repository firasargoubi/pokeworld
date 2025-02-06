import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CreatePageComponent } from './create-page.component';
import { GameService } from '@app/services/game-save/game-save.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameData } from '@common/game-data';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let gameDataServiceMock: jasmine.SpyObj<GameDataService>;
    let router: Router;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['getAllGames', 'getGame']);
        gameServiceSpy.getAllGames.and.returnValue(of([]));
        gameServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), CreatePageComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: GameDataService, useValue: gameDataServiceMock },
            ],
        }).compileComponents();

        gameDataServiceMock = TestBed.inject(GameDataService) as jasmine.SpyObj<GameDataService>;
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(CreatePageComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on init', () => {
        gameServiceSpy.getAllGames.and.returnValue(of(MOCK_GAMES));

        component.ngOnInit();

        expect(component.games).toEqual(MOCK_GAMES);
    });

    it('should call loadGames when handleNotFoundError is called', () => {
        const loadGamesSpy = spyOn(component, 'loadGames');
        const error = new HttpErrorResponse({ error: 'Game not found', status: 404 });
        component['handleNotFoundError'](error);

        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should return correct card color', () => {
        expect(component.getCardColor(0)).toBe('blue-card');
        expect(component.getCardColor(1)).toBe('green-card');
        expect(component.getCardColor(2)).toBe('pink-card');
    });

    it('should handle game visibility on join', () => {
        const navigateSpy = spyOn(router, 'navigate');
        gameServiceSpy.getGame.and.returnValue(of(MOCK_GAMES[0]));

        component.onJoin(MOCK_GAMES[0]._id);

        expect(gameDataServiceMock.setGameData).toHaveBeenCalledWith(MOCK_GAMES[0]);
        expect(navigateSpy).toHaveBeenCalledWith(['/player-selection']);
    });

    it('should handle not found error on join', () => {
        const errorResponse = new HttpErrorResponse({ error: 'test 404 error', status: HttpStatusCode.NotFound });
        gameServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        spyOn(window, 'alert');
        component.onJoin(MOCK_GAMES[0]._id);

        expect(window.alert).toHaveBeenCalledWith("Ce jeu n'existe plus !");
        expect(gameServiceSpy.getAllGames).toHaveBeenCalled();
    });

    it('should handle game not visible on join', () => {
        const invisibleGame = { ...MOCK_GAMES[0], isVisible: false };
        gameServiceSpy.getGame.and.returnValue(of(invisibleGame));

        spyOn(window, 'alert');
        component.onJoin(invisibleGame._id);

        expect(window.alert).toHaveBeenCalledWith("Ce jeu n'est plus visible !");
        expect(gameServiceSpy.getAllGames).toHaveBeenCalled();
    });

    it('should call snackBar open when handleError is called', () => {
        const snackBarOpenSpy = spyOn(component['snackBar'], 'open');

        const error = new HttpErrorResponse({ error: 'Test error', status: 500 });

        component['handleError'](error);

        expect(snackBarOpenSpy).toHaveBeenCalledWith(error.message, 'Close', { duration: 5000 });
    });
});
