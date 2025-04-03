import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { LobbyPageComponent } from './lobby-page.component';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let matchServiceSpy: jasmine.SpyObj<MatchService>;
    let lobbyServiceSpy: jasmine.SpyObj<LobbyService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let clipboardSpy: jasmine.SpyObj<Clipboard>;

    beforeEach(async () => {
        const mockMatchData = structuredClone(MOCK_MATCH_DATAS[0]);
        mockMatchData.players.pop();

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        lobbyServiceSpy = jasmine.createSpyObj('LobbyService', ['startMatch', 'kickPlayer', 'changeLockStatus']);
        clipboardSpy = jasmine.createSpyObj('clipboard', ['writeText']);
        matchServiceSpy = jasmine.createSpyObj('MatchService', ['isInMatch', 'isState', 'isHost', 'leaveMatch'], {
            matchUpdate: { pipe: () => ({ subscribe: () => ({}) }) },
            data: mockMatchData,
        });

        await TestBed.configureTestingModule({
            imports: [LobbyPageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: LobbyService, useValue: lobbyServiceSpy },
                { provide: MatchService, useValue: matchServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to home when matchCode is empty', () => {
        fixture.destroy();

        Object.defineProperty(lobbyServiceSpy, 'matchCode', { value: '', configurable: true });

        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });

    it('should start match button call start match', () => {
        component.startMatchButton();
        expect(lobbyServiceSpy.startMatch).toHaveBeenCalled();
    });

    it('should toggle lock room change lock status', () => {
        component.toggleLockRoom();
        expect(lobbyServiceSpy.changeLockStatus).toHaveBeenCalled();
    });

    it('should call showPopup when leaveLobbyButton is called', () => {
        component.leaveLobbyButton();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Voulez-vous vraiment quitter ?', true, jasmine.any(Function));
    });

    it('should kickPlayer when kickPlayer is called', () => {
        component.kickPlayer('playerId');
        expect(lobbyServiceSpy.kickPlayer).toHaveBeenCalledWith('playerId');
    });

    it('should copy match code to clipboard', () => {
        Object.defineProperty(navigator, 'clipboard', { value: clipboardSpy, writable: true, configurable: true });
        component.copyMatchCode();
        expect(clipboardSpy.writeText).toHaveBeenCalled();
    });
});
