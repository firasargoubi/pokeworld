import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '@app/services/game.service';
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
        const spy = jasmine.createSpyObj('GameService', ['getAllGames', 'toggleVisibility', 'deleteGame']);
        spy.getAllGames.and.returnValue(of([]));
        spy.toggleVisibility.and.returnValue(of({} as GameData));
        spy.deleteGame.and.returnValue(of(undefined));

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

        component.editGame(gameId);
        gameServiceSpy.deleteGame.and.returnValue(of(undefined));

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

    it('should call handleError when toggleVisibility, loadGames or delete fails', () => {
        const toggleError = new HttpErrorResponse({ error: 'Toggle failed', status: 500 });
        const loadError = new HttpErrorResponse({ error: 'Load failed', status: 500 });
        const deleteError = new HttpErrorResponse({ error: 'Delete failed', status: 500 });

        gameServiceSpy.toggleVisibility.and.returnValue(throwError(() => toggleError));
        gameServiceSpy.getAllGames.and.returnValue(throwError(() => loadError));
        gameServiceSpy.deleteGame.and.returnValue(throwError(() => deleteError));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        const handleErrorSpy = spyOn<any>(component, 'handleError');

        component.toggleVisibility({ id: '123', isVisible: true });
        component.loadGames();
        component.deleteGame('1234');

        expect(handleErrorSpy).toHaveBeenCalledWith('Failed to toggle game visibility. Please try again later.', toggleError);
        expect(handleErrorSpy).toHaveBeenCalledWith('Failed to load games. Please try again later.', loadError);
        expect(handleErrorSpy).toHaveBeenCalledWith('Failed to delete game. Please try again later.', deleteError);
    });

    it('should call snackBar open when handleError is called', () => {
        const snackBarOpenSpy = spyOn(component['snackBar'], 'open');

        const error = new HttpErrorResponse({ error: 'Test error', status: 500 });

        component['handleError']('Test error message', error);

        expect(snackBarOpenSpy).toHaveBeenCalledWith('Test error message: ' + error.message, 'Close', { duration: 5000 });
    });
});
