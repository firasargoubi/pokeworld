import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [LobbyPageComponent],
            providers: [{ provide: Router, useValue: routerSpy }],
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

    it('should toggle isLocked state when toggleLock is called', () => {
        const initialLockState = component.isLocked;
        component.toggleLock();
        expect(component.isLocked).toBe(!initialLockState);
    });
});
