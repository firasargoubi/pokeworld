import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let gameDataServiceMock: jasmine.SpyObj<GameDataService>;
    let router: Router;

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj('GameSaveService', ['getAllGames', 'getGame']);
        gameSaveServiceSpy.getAllGames.and.returnValue(of([]));
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), CreatePageComponent],
            providers: [
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: GameDataService, useValue: gameDataServiceMock },
            ],
        }).compileComponents();

        gameDataServiceMock = TestBed.inject(GameDataService) as jasmine.SpyObj<GameDataService>;
        gameSaveServiceSpy = TestBed.inject(GameSaveService) as jasmine.SpyObj<GameSaveService>;
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(CreatePageComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on init', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of(MOCK_GAMES));

        component.ngOnInit();

        expect(component.games).toEqual(MOCK_GAMES);
    });

    it('should navigate to menu when navigateToMenu is called', () => {
        const navigateSpy = spyOn(router, 'navigate');

        component.navigateToMenu();

        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should call loadGames when handleNotFoundError is called', () => {
        // private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadGamesSpy = spyOn(component as any, 'loadGames');
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
        gameSaveServiceSpy.getGame.and.returnValue(of(MOCK_GAMES[0]));

        component.onJoin(MOCK_GAMES[0]._id);

        expect(gameDataServiceMock.setGameData).toHaveBeenCalledWith(MOCK_GAMES[0]);
        expect(navigateSpy).toHaveBeenCalledWith(['/player-selection']);
    });

    it('should handle not found error on join', () => {
        const errorResponse = new HttpErrorResponse({ error: 'test 404 error', status: HttpStatusCode.NotFound });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        spyOn(window, 'alert');
        component.onJoin(MOCK_GAMES[0]._id);

        expect(window.alert).toHaveBeenCalledWith("Ce jeu n'existe plus !");
        expect(gameSaveServiceSpy.getAllGames).toHaveBeenCalled();
    });

    it('should handle game not visible on join', () => {
        const invisibleGame = { ...MOCK_GAMES[0], isVisible: false };
        gameSaveServiceSpy.getGame.and.returnValue(of(invisibleGame));

        spyOn(window, 'alert');
        component.onJoin(invisibleGame._id);
        expect(window.alert).toHaveBeenCalledWith("Ce jeu n'est plus visible !");
        expect(gameSaveServiceSpy.getAllGames).toHaveBeenCalled();
    });

    it('should handle error when loadGames fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Test error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));
        // private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleErrorSpy = spyOn<any>(component, 'handleError');
        component['loadGames']();

        expect(handleErrorSpy).toHaveBeenCalledWith(errorResponse);
    });

    it('should filter visible games when loadGames is called', () => {
        const mockGames = [
            { ...MOCK_GAMES[0], isVisible: true },
            { ...MOCK_GAMES[1], isVisible: false },
        ];
        gameSaveServiceSpy.getAllGames.and.returnValue(of(mockGames));

        component['loadGames']();

        expect(component.games).toEqual([mockGames[0]]);
    });

    it('should call handleError when handleNotFoundError is called with non-NotFound error', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Test error', status: HttpStatusCode.InternalServerError });
        // private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleErrorSpy = spyOn<any>(component, 'handleError');

        component['handleNotFoundError'](errorResponse);

        expect(handleErrorSpy).toHaveBeenCalledWith(errorResponse);
    });

    it('should remove message correctly', () => {
        const message = { message: 'Test message', isConfirmation: false };
        component.messages.push(message);
        component.removeMessage(0);
        expect(component.messages.length).toBe(0);
    });

    it('should handle error when loadGames is called', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Test error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));
        component['loadGames']();
        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe('Test error');
    });

    it('should handle error when handleNotFoundError is called', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Test error', status: HttpStatusCode.InternalServerError });
        component['handleNotFoundError'](errorResponse);
        expect(component.messages.length).toBe(1);
        expect(component.messages[0].message).toBe('Test error');
    });
});
