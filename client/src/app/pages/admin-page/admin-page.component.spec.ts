import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    // EDIT dans plusieurs tests mock constante pour sercvice et components.
    const getMockGames = () => {
        return [
            {
                _id: '123',
                name: 'Game 1',
                isVisible: true,
                description: 'Description 1',
                lastEdited: new Date(),
                mapData: {
                    tiles: [],
                    items: {} as Record<ItemType, Position[]>,
                    size: MapSize.Medium,
                    gameMode: GameMode.CTF,
                },
                thumbnail: 'path',
            },
            {
                _id: '456',
                name: 'Game 2',
                isVisible: true,
                description: 'Description 2',
                lastEdited: new Date(),
                mapData: {
                    tiles: [],
                    items: {} as Record<ItemType, Position[]>,
                    size: MapSize.Large,
                    gameMode: GameMode.CTF,
                },
                thumbnail: 'path',
            },
        ];
    };

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GameService', ['getAllGames', 'getGame', 'toggleVisibility', 'deleteGame']);
        spy.getAllGames.and.returnValue(of([]));
        spy.getGame.and.returnValue(of({} as GameData));
        spy.toggleVisibility.and.returnValue(of({} as GameData));
        spy.deleteGame.and.returnValue(of(undefined));
        // CHECK

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), AdminPageComponent],
            providers: [{ provide: GameService, useValue: spy }],
        }).compileComponents();

        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
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
        const mockGames: GameData[] = getMockGames();
        gameServiceSpy.getAllGames.and.returnValue(of(mockGames));

        component.loadGames();

        expect(gameServiceSpy.getAllGames).toHaveBeenCalled();
        expect(component.games).toEqual(mockGames);
    });

    it('should navigate to edit page and store game id in sessionStorage when editGame is called', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const setItemSpy = spyOn(sessionStorage, 'setItem');
        const gameId = '123';

        gameServiceSpy.getGame.and.returnValue(of({} as GameData));
        component.editGame(gameId);

        expect(setItemSpy).toHaveBeenCalledWith('editGameId', gameId);
        expect(navigateSpy).toHaveBeenCalledWith(['/edit']);
    });

    it('should toggle visibility when toggleVisibility is called', () => {
        const toggleVisibilitySpy = gameServiceSpy.toggleVisibility;
        const event = { id: '123', isVisible: true };

        component.toggleVisibility(event);

        expect(toggleVisibilitySpy).toHaveBeenCalledWith(event.id);
    });

    it('should delete game when deleteGame is called', () => {
        const mockGames: GameData[] = getMockGames();

        gameServiceSpy.getAllGames.and.returnValue(of(mockGames));
        gameServiceSpy.deleteGame.and.returnValue(of(undefined));

        component.ngOnInit();

        component.deleteGame(mockGames[0]._id);

        expect(gameServiceSpy.deleteGame).toHaveBeenCalledWith(mockGames[0]._id);

        expect(component.games.length).toBe(1);
        expect(component.games[0]._id).toBe(mockGames[1]._id);
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

    it('should handle not found error when editGame, toggleVisibility or deleteGame fails (NOT_FOUND)', () => {
        const notFoundError = new HttpErrorResponse({ error: 'Game not found', status: 404 });

        gameServiceSpy.getGame.and.returnValue(throwError(() => notFoundError));
        gameServiceSpy.toggleVisibility.and.returnValue(throwError(() => notFoundError));
        gameServiceSpy.deleteGame.and.returnValue(throwError(() => notFoundError));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const handleNotFoundErrorSpy = spyOn<any>(component, 'handleNotFoundError');

        component.editGame('123');
        component.toggleVisibility({ id: '123', isVisible: true });
        component.deleteGame('123');

        expect(handleNotFoundErrorSpy).toHaveBeenCalledWith(notFoundError);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 3 calls
        expect(handleNotFoundErrorSpy).toHaveBeenCalledTimes(3); // CHECK
    });

    it('should call loadGames when handleNotFoundError is called', () => {
        const loadGamesSpy = spyOn(component, 'loadGames');

        const error = new HttpErrorResponse({ error: 'Game not found', status: 404 });

        component['handleNotFoundError'](error);

        expect(loadGamesSpy).toHaveBeenCalled();
    });

    it('should call handleError when loadGames, toggleVisibility or delete fails (INTERNAL_ERROR)', () => {
        const error = new HttpErrorResponse({ error: 'Action failed', status: 500 });

        gameServiceSpy.getAllGames.and.returnValue(throwError(() => error));
        gameServiceSpy.toggleVisibility.and.returnValue(throwError(() => error));
        gameServiceSpy.deleteGame.and.returnValue(throwError(() => error));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const handleErrorSpy = spyOn<any>(component, 'handleError');

        component.toggleVisibility({ id: '123', isVisible: true });
        component.loadGames();
        component.deleteGame('1234');

        expect(handleErrorSpy).toHaveBeenCalledWith(error);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 3 calls
        expect(handleErrorSpy).toHaveBeenCalledTimes(3);
    });

    it('should call snackBar open when handleError is called', () => {
        const snackBarOpenSpy = spyOn(component['snackBar'], 'open');

        const error = new HttpErrorResponse({ error: 'Test error', status: 500 });

        component['handleError'](error);

        expect(snackBarOpenSpy).toHaveBeenCalledWith(error.message, 'Close', { duration: 5000 });
    });
});
