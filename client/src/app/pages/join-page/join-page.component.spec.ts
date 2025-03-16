/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerSelectionService } from '@app/services/player-selection/player-selection.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { of } from 'rxjs';
import { JoinPageComponent } from './join-page.component';

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let lobbySocketsServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let playerSelectionServiceSpy: jasmine.SpyObj<PlayerSelectionService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        lobbySocketsServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['joinMatch']);
        playerSelectionServiceSpy = jasmine.createSpyObj('PlayerSelectionService', ['matchCode']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, HeaderComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: LobbySocketsService, useValue: lobbySocketsServiceSpy },
                { provide: PlayerSelectionService, useValue: playerSelectionServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to player-selection on successful join', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.gameCode = 'ABC123';
        lobbySocketsServiceSpy.joinMatch.and.returnValue(of(true));

        component.joinMatch(event);

        expect(playerSelectionServiceSpy.matchCode).toBe('ABC123');
        expect(lobbySocketsServiceSpy.joinMatch).toHaveBeenCalledWith('ABC123');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/player-selection']);
    });

    it('should not navigate on unsuccessful join', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.gameCode = 'ABC123';
        lobbySocketsServiceSpy.joinMatch.and.returnValue(of(false));

        component.joinMatch(event);

        expect(playerSelectionServiceSpy.matchCode).toBe('ABC123');
        expect(lobbySocketsServiceSpy.joinMatch).toHaveBeenCalledWith('ABC123');
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to menu when navigateToMenu is called', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
