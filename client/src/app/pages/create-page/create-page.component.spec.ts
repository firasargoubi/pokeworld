import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { MOCK_GAMES } from '@app/consts/tests/mock-games';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { PopupService } from '@app/services/popup/popup.service';
import { GameData } from '@common/game-data';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

@Component({
    selector: 'app-game-card',
    standalone: true,
    template: '',
})
class MockGameCardComponent {}

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let gameDataServiceMock: jasmine.SpyObj<GameDataService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let mockGames: GameData[];

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj('GameSaveService', ['getAllGames', 'getGame']);
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        gameSaveServiceSpy.getAllGames.and.returnValue(of([]));
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);

        await TestBed.configureTestingModule({
            providers: [
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: GameDataService, useValue: gameDataServiceMock },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        TestBed.overrideComponent(CreatePageComponent, {
            add: { imports: [MockGameCardComponent] },
            remove: { imports: [GameCardComponent] },
        });

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mockGames = structuredClone(MOCK_GAMES);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on init', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of(mockGames));
        component.ngOnInit();
        expect(component.games).toEqual(mockGames);
    });

    it('should navigate to menu when navigateToMenu is called', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return correct card color', () => {
        expect(component.getCardColor(0)).toBe('blue-card');
        expect(component.getCardColor(1)).toBe('green-card');
        expect(component.getCardColor(2)).toBe('pink-card');
    });

    it('should handle error when loadGames fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));
        component['loadGames']();
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should filter visible games when loadGames is called', () => {
        gameSaveServiceSpy.getAllGames.and.returnValue(of(mockGames));
        component['loadGames']();
        expect(component.games).toEqual(mockGames.filter((game) => game.isVisible));
    });
});
