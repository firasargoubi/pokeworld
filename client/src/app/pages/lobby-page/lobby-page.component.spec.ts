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
        lobbySocketsServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['toggleLockRoom', 'leaveGame'], {
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

    it('should navigate to game page when startGame is called', () => {
        component.startGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to home page when leaveLobby is called', () => {
        component.leaveLobby();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call toggleLockRoom(true) when lockRoom is called', () => {
        component.lockRoom();
        expect(lobbySocketsServiceSpy.toggleLockRoom).toHaveBeenCalledWith(true);
    });

    it('should call toggleLockRoom(false) when unlockRoom is called', () => {
        component.unlockRoom();
        expect(lobbySocketsServiceSpy.toggleLockRoom).toHaveBeenCalledWith(false);
    });

    it('should call leaveGame when leaveLobby is called', () => {
        component.leaveLobby();
        expect(lobbySocketsServiceSpy.leaveGame).toHaveBeenCalled();
    });
});
