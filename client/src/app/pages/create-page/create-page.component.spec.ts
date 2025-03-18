import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
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
    let lobbySocketServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let mockGames: GameData[];

    beforeEach(async () => {
        gameSaveServiceSpy = jasmine.createSpyObj('GameSaveService', ['getAllGames', 'getGame']);
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        gameSaveServiceSpy.getAllGames.and.returnValue(of([]));
        gameSaveServiceSpy.getGame.and.returnValue(of({} as GameData));
        gameDataServiceMock = jasmine.createSpyObj('GameDataService', ['setGameData']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        lobbySocketServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['createMatch']);

        await TestBed.configureTestingModule({
            providers: [
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: GameDataService, useValue: gameDataServiceMock },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: LobbySocketsService, useValue: lobbySocketServiceSpy },
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
        mockGames = structuredClone(MOCK_GAME_DATAS);
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
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
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

    it('should handle createMatch success and failure', async () => {
        lobbySocketServiceSpy.createMatch.and.returnValue(Promise.resolve(true));
        await component.createMatch(MOCK_GAME_DATAS[0]);
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.PlayerSelection]);
        expect(popupServiceSpy.showPopup).not.toHaveBeenCalled();

        lobbySocketServiceSpy.createMatch.and.returnValue(Promise.resolve(false));
        spyOn(component as CreatePageComponent & { loadGames: () => void }, 'loadGames');
        await component.createMatch(MOCK_GAME_DATAS[0]);
        expect(component['loadGames']).toHaveBeenCalled();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith("Ce jeu n'est plus disponible");
    });
});
