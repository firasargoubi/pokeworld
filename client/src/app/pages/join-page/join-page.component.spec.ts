/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { of } from 'rxjs';
import { JoinPageComponent } from './join-page.component';

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let lobbySocketServiceSpy: jasmine.SpyObj<LobbySocketsService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        lobbySocketServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['joinMatch']);

        await TestBed.configureTestingModule({
            imports: [FormsModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: LobbySocketsService, useValue: lobbySocketServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        component.gameCode = '1234';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to player selection if joinGame returns true', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        lobbySocketServiceSpy.joinMatch.and.returnValue(of(true));

        component.joinMatch(event);

        expect(lobbySocketServiceSpy.joinMatch).toHaveBeenCalledWith('1234');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/player-selection']);
    });

    it('should navigate to menu', () => {
        component.navigateToMenu();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
