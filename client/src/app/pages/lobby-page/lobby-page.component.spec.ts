import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let lobbySocketsServiceSpy: jasmine.SpyObj<LobbySocketsService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        lobbySocketsServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['toggleLockRoom', 'leaveMatch'], {
            roomLocked$: of(false),
            players$: of([]),
        });

        await TestBed.configureTestingModule({
            imports: [LobbyPageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
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

    it('should call leaveGame when leaveLobby is called', () => {
        component.leaveLobby();
        expect(lobbySocketsServiceSpy.leaveGame).toHaveBeenCalled();
    });

    it('should toggle room lock status when toggleLockRoom is called', () => {
        component.isRoomLocked = false;
        component.toggleLockRoom();
        expect(lobbySocketsServiceSpy.toggleLockRoom).toHaveBeenCalledWith(true);

        component.isRoomLocked = true;
        component.toggleLockRoom();
        expect(lobbySocketsServiceSpy.toggleLockRoom).toHaveBeenCalledWith(false);
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
