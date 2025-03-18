import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MapSize } from '@common/interfaces/map-data';
import { Player } from '@common/interfaces/player';
import { MOCK_PLAYERS } from '@common/test-consts/mock-players';
import { of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let lobbySocketsServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let clipboardSpy: jasmine.SpyObj<Clipboard>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        lobbySocketsServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['changeLockStatus', 'leaveMatch', 'startMatch', 'kickPlayer'], {
            roomLocked$: of(false),
            players$: of([]),
        });
        clipboardSpy = jasmine.createSpyObj('clipboard', ['writeText']);

        await TestBed.configureTestingModule({
            imports: [LobbyPageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: LobbySocketsService, useValue: lobbySocketsServiceSpy },
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

        Object.defineProperty(lobbySocketsServiceSpy, 'matchCode', { value: '', configurable: true });

        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });

    it('should call startMatch when startMatchButton is called', () => {
        component.startMatchButton();
        expect(lobbySocketsServiceSpy.startMatch).toHaveBeenCalled();
    });

    it('should call showPopup when leaveLobbyButton is called', () => {
        component.leaveLobbyButton();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Voulez-vous vraiment quitter ?', true, jasmine.any(Function));
    });

    it('should toggle room lock status when toggleLockRoom is called', () => {
        component.isRoomLocked = false;
        component.toggleLockRoom();
        expect(lobbySocketsServiceSpy.changeLockStatus).toHaveBeenCalledWith(true);

        component.isRoomLocked = true;
        component.toggleLockRoom();
        expect(lobbySocketsServiceSpy.changeLockStatus).toHaveBeenCalledWith(false);
    });

    it('should return correct match code', () => {
        lobbySocketsServiceSpy.matchCode = 'ABC123';
        expect(component.matchCode).toBe('ABC123');
    });

    it('should subscribe to players$ observable', () => {
        component.players$.subscribe((players) => {
            expect(players).toEqual([]);
        });
    });

    it('should kickPlayer when kickPlayer is called', () => {
        component.kickPlayer('playerId');
        expect(lobbySocketsServiceSpy.kickPlayer).toHaveBeenCalledWith('playerId');
    });

    it('should copy match code to clipboard', () => {
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', { value: clipboardSpy, writable: true, configurable: true });

        lobbySocketsServiceSpy.matchCode = '1234';
        component.copyMatchCode();
        expect(clipboardSpy.writeText).toHaveBeenCalledWith('1234');

        lobbySocketsServiceSpy.matchCode = '';
        component.copyMatchCode();
        expect(clipboardSpy.writeText).toHaveBeenCalledWith('');

        Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, writable: true, configurable: true });
    });

    it('should calculate availebelPlayers correctly based on connected players', () => {
        const mockPlayers: Player[] = [MOCK_PLAYERS[0], MOCK_PLAYERS[1]];

        Object.defineProperty(lobbySocketsServiceSpy, 'players$', {
            value: of(mockPlayers),
            writable: true,
        });
        spyOn(component['gameDataService'], 'getMapSize').and.returnValue(MapSize.Small);

        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.availebelPlayers.length).toBe(0);
    });
});
