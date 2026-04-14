import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { TranslateModule } from '@ngx-translate/core';

describe('MenuButtonComponent', () => {
    let component: MenuButtonComponent;
    let fixture: ComponentFixture<MenuButtonComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let preferencesServiceSpy: jasmine.SpyObj<PreferencesService>;
    const delay = 200;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', ['getPartyBallAsset']);
        preferencesServiceSpy.getPartyBallAsset.and.callFake((isActive?: boolean) =>
            isActive ? './assets/images/menu/buttons/poke-button/party-ball-sel-1.png' : './assets/images/menu/buttons/poke-button/party-ball-1.png',
        );

        await TestBed.configureTestingModule({
            imports: [MenuButtonComponent, TranslateModule.forRoot()],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: PreferencesService, useValue: preferencesServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MenuButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default @Input values', () => {
        expect(component.containerClass).toBe('container orange-container');
        expect(component.spriteImage).toBe('./assets/images/menu/pokemon/normal/charizard.png');
        expect(component.textContent).toBe('');
    });

    it('should use the selected party ball assets from preferences', () => {
        expect(component.inactivePartyBallAsset).toContain('party-ball-1.png');
        expect(component.activePartyBallAsset).toContain('party-ball-sel-1.png');
    });

    it('should navigate with delay when navigateWithDelay is called', (done) => {
        component.routePath = '/test-path';

        component.navigateWithDelay();

        setTimeout(() => {
            expect(component.isActive).toBeFalse();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/test-path']);
            done();
        }, delay);
    });
});
