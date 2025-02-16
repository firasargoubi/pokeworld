import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [CommonModule, HeaderComponent, PokeballButtonComponent, LobbyPageComponent],
            providers: [{ provide: Router, useValue: routerSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should generate a 4-digit access code on init', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(component, 'generateAccessCode');
        component.ngOnInit();
        expect(component.accessCode).toMatch(/^\d{4}$/);
    });

    it('should navigate to game page when startGame is called', () => {
        component.startGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to home page when leaveLobby is called', () => {
        component.leaveLobby();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should display the access code in the template', () => {
        component['generateAccessCode']();
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.access-code').textContent).toContain(component.accessCode);
    });
});
