import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { PopupService } from '@app/services/popup/popup.service';
import { GameData } from '@common/game-data';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let gameDataServiceMock: jasmine.SpyObj<GameDataService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let router: Router;

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj('GameSaveService', ['getAllGames', 'getGame']);
        gameSaveServiceSpy.getAllGames.and.returnValue(of([]));
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), CreatePageComponent],
            providers: [
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: GameDataService, useValue: gameDataServiceMock },
                { provide: PopupService, useValue: popupServiceSpy },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(CreatePageComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on init', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of([{ _id: '1', isVisible: true } as GameData]));

        component.ngOnInit();

        expect(component.games).toEqual([{ _id: '1', isVisible: true } as GameData]);
    });

    it('should navigate to menu when navigateToMenu is called', () => {
        const navigateSpy = spyOn(router, 'navigate');

        component.navigateToMenu();

        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should call loadGames when handleNotFoundError is called', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
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
        gameSaveServiceSpy.getGame.and.returnValue(of({ _id: '1', isVisible: true } as GameData));

        component.onJoin('1');

        expect(gameDataServiceMock.setGameData).toHaveBeenCalledWith({ _id: '1', isVisible: true } as GameData);
        expect(navigateSpy).toHaveBeenCalledWith(['/player-selection']);
    });

    it('should handle not found error on join', () => {
        const errorResponse = new HttpErrorResponse({ error: 'test 404 error', status: HttpStatusCode.NotFound });
        gameSaveServiceSpy.getGame.and.returnValue(throwError(() => errorResponse));

        component.onJoin('1');

        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith("Ce jeu n'existe plus");
        expect(gameSaveServiceSpy.getAllGames).toHaveBeenCalled();
    });

    it('should handle game not visible on join', () => {
        const invisibleGame = { _id: '1', isVisible: false } as GameData;
        gameSaveServiceSpy.getGame.and.returnValue(of(invisibleGame));

        component.onJoin('1');

        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith("Ce jeu n'est plus visible");
        expect(gameSaveServiceSpy.getAllGames).toHaveBeenCalled();
    });

    it('should handle error when loadGames fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Test error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));

        component['loadGames']();

        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Test error');
    });

    it('should filter visible games when loadGames is called', () => {
        const mockGames = [{ _id: '1', isVisible: true } as GameData, { _id: '2', isVisible: false } as GameData];
        gameSaveServiceSpy.getAllGames.and.returnValue(of(mockGames));

        component['loadGames']();

        expect(component.games).toEqual([{ _id: '1', isVisible: true } as GameData]);
    });

    it('should call handleError when handleNotFoundError is called with non-NotFound error', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Test error', status: HttpStatusCode.InternalServerError });

        component['handleNotFoundError'](errorResponse);

        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Test error');
    });
});
