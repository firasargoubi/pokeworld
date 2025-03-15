import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let lobbySocketsServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        lobbySocketsServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['changeLockStatus', 'leaveMatch', 'startMatch', 'kickPlayer'], {
            roomLocked$: of(false),
            players$: of([]),
        });

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
        lobbySocketsServiceSpy.matchRoomCode = 'ABC123';
        expect(component.matchCode).toBe('ABC123');
    });

    it('should subscribe to players$ observable', () => {
        component.players$.subscribe((players) => {
            expect(players).toEqual([]);
        });
    });
});
