/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { CharacterService } from '@app/services/character/character.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { of } from 'rxjs';
import { JoinPageComponent } from './join-page.component';

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let lobbySocketsServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let characterServiceSpy: jasmine.SpyObj<CharacterService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        lobbySocketsServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['joinMatch']);
        characterServiceSpy = jasmine.createSpyObj('CharacterService', ['matchCode']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, HeaderComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: LobbySocketsService, useValue: lobbySocketsServiceSpy },
                { provide: CharacterService, useValue: characterServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to character on successful join', () => {
        const matchCode = 'ABC123';
        const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.gameCode = matchCode;
        lobbySocketsServiceSpy.joinMatch.and.returnValue(of(true));

        component.joinMatch(mockEvent);

        expect(lobbySocketsServiceSpy.joinMatch).toHaveBeenCalledWith(matchCode);
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.character]);
    });

    it('should not navigate on unsuccessful join', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.gameCode = 'ABC123';
        lobbySocketsServiceSpy.joinMatch.and.returnValue(of(false));

        component.joinMatch(event);

        expect(lobbySocketsServiceSpy.joinMatch).toHaveBeenCalledWith('ABC123');
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to menu when navigateToMenu is called', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });
});
