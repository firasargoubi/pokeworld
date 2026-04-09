import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { PreMatchSettingsPopupComponent } from '@app/components/pre-match-settings-popup/pre-match-settings-popup.component';
import { PopupMessage } from '@app/consts/popup-message.const';
import { AudioService } from '@app/services/audio/audio.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { GameState } from '@common/interfaces/game-state.enum';
import { MatchSettings } from '@common/interfaces/match-data';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

@Component({
    selector: 'app-game-card',
    standalone: true,
    template: '',
})
class MockGameCardComponent {
    @Input() game: GameData = structuredClone(MOCK_GAME_DATAS[0]);
    @Input() isAdminView: boolean = false;
    @Input() cardColor: string = 'blue-card';
    @Input() index: number = 0;
}

@Component({
    selector: 'app-chat',
    standalone: true,
    template: '',
})
class MockChatComponent {
    @Input() isInGame: boolean = false;
}

@Component({
    selector: 'app-match-settings-popup',
    standalone: true,
    template: '',
})
class MockMatchSettingsPopupComponent {
    @Input() isVisible: boolean = false;
}

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let gameSaveServiceSpy: jasmine.SpyObj<GameSaveService>;
    let matchServiceSpy: jasmine.SpyObj<MatchService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let mockAudioService: jasmine.SpyObj<AudioService>;
    let gameDataService: jasmine.SpyObj<GameDataService>;
    let mockGames: GameData[];

    beforeEach(async () => {
        mockGames = structuredClone(MOCK_GAME_DATAS);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        gameSaveServiceSpy = jasmine.createSpyObj('GameSaveService', ['getAllGames', 'getGame']);
        gameSaveServiceSpy.getAllGames.and.returnValue(of(mockGames));
        matchServiceSpy = jasmine.createSpyObj('MatchService', ['createMatch']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'playBackgroundMusic', 'preloadEffectsForPage', 'playCombatEffect']);
        gameDataService = jasmine.createSpyObj('GameDataService', ['isOwner']);
        gameSaveServiceSpy.getGame.and.returnValue(of(mockGames[0]));
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: GameSaveService, useValue: gameSaveServiceSpy },
                { provide: MatchService, useValue: matchServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: AudioService, useValue: mockAudioService },
                { provide: GameDataService, useValue: gameDataService },
            ],
        }).compileComponents();

        TestBed.overrideComponent(CreatePageComponent, {
            add: { imports: [MockGameCardComponent, MockChatComponent, MockMatchSettingsPopupComponent] },
            remove: { imports: [GameCardComponent, ChatComponent, PreMatchSettingsPopupComponent] },
        });

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const mockMatchSettings: MatchSettings = {
        isElementalMode: false,
        isDropInEnabled: false,
        isRapidElimination: false,
        entryFee: 0,
        isFriendOnly: false,
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open settings popup when openSettings is called', () => {
        component.openSettings(mockGames[0]);
        expect(component.isSettingsPopupVisible).toBeTrue();
        expect(component.pendingGame).toEqual(mockGames[0]);
    });

    it('should close popup and call createMatch on settings selected', () => {
        component.openSettings(mockGames[0]);
        spyOn(component, 'createMatch');
        component.onSettingsSelected(mockMatchSettings);
        expect(component.isSettingsPopupVisible).toBeFalse();
        expect(component.createMatch).toHaveBeenCalledWith(mockGames[0], mockMatchSettings);
        expect(component.pendingGame).toBeNull();
    });

    it('should create match call create match', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isGameAccessible').and.returnValue(true);
        component.createMatch(mockGames[0], mockMatchSettings);
        expect(matchServiceSpy.createMatch).toHaveBeenCalledWith(mockGames[0], mockMatchSettings);
    });

    it('should call handleUnauthorizedAccess when game is not accessible', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unauthorizedSpy = spyOn<any>(component, 'handleUnauthorizedAccess');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isGameAccessible').and.returnValue(false);
        component.createMatch(mockGames[0], mockMatchSettings);
        expect(matchServiceSpy.createMatch).not.toHaveBeenCalled();
        expect(unauthorizedSpy).toHaveBeenCalled();
    });

    describe('isGameAccessible', () => {
        it('returns true for a public game even if user is not owner', () => {
            const game: GameData = structuredClone(mockGames[0]);
            game.gameState = GameState.PUBLIC;
            gameDataService.isOwner.and.returnValue(false);
            expect(component['isGameAccessible'](game)).toBeTrue();
        });

        it('returns true for a private-shared game even if user is not owner', () => {
            const game: GameData = structuredClone(mockGames[0]);
            game.gameState = GameState.PRIVATE_SHARED;
            gameDataService.isOwner.and.returnValue(false);
            expect(component['isGameAccessible'](game)).toBeTrue();
        });

        it('returns true for a private game when user is owner', () => {
            const game: GameData = structuredClone(mockGames[0]);
            game.gameState = GameState.PRIVATE;
            gameDataService.isOwner.and.returnValue(true);
            expect(component['isGameAccessible'](game)).toBeTrue();
        });

        it('returns false for a private game when user is not owner', () => {
            const game: GameData = structuredClone(mockGames[0]);
            game.gameState = GameState.PRIVATE;
            gameDataService.isOwner.and.returnValue(false);
            expect(component['isGameAccessible'](game)).toBeFalse();
        });
    });

    it('handleUnauthorizedAccess should show unauthorized popup and reload games', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadSpy = spyOn<any>(component, 'loadGames');
        component['handleUnauthorizedAccess']();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith({
            message: PopupMessage.UnauthorizedAccessToGame,
            hasCloseButton: true,
            isConfirmation: false,
        });
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should navigate to menu when navigate to menu is called', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });

    it('should load games on init', () => {
        component.ngOnInit();
        expect(component.games).toEqual(mockGames);
    });

    it('should navigate to menu when navigate to menu is called', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });

    it('should handle error when loadGames fails', () => {
        const errorResponse = new HttpErrorResponse({ error: 'Error', status: 500 });
        gameSaveServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));
        component['loadGames']();
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });
});
