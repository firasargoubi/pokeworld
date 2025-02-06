import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerSelectionPageComponent } from './player-selection-page.component';
import { By } from '@angular/platform-browser';

describe('PlayerSelectionPageComponent', () => {
    let component: PlayerSelectionPageComponent;
    let fixture: ComponentFixture<PlayerSelectionPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [PlayerSelectionPageComponent],
            providers: [{ provide: Router, useValue: routerSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial form state', () => {
        const nameInput = component.nameForm;
        const bonusForm = component.bonusForm;

        expect(nameInput.value).toBe('');
        expect(nameInput.valid).toBeFalse();
        expect(bonusForm.get('points')?.value).toBe('life');
        expect(bonusForm.get('bonusDice')?.value).toBe(component.diceOptions.Option1.toString());
    });

    it('should display warning message for invalid name', () => {
        component['isStartClicked'].set(true);
        component.nameForm.setValue('ab');
        fixture.detectChanges();

        const warningMessage = fixture.debugElement.query(By.css('.warning'));
        expect(warningMessage.nativeElement.textContent).toContain('Vous devez entrer un pseudo entre 3 et 20 characteres !');
    });

    it('should display warning message for unselected avatar', () => {
        component['isStartClicked'].set(true);
        component.selectedAvatar = component.avatarList[0];
        fixture.detectChanges();

        const warningMessage = fixture.debugElement.query(By.css('.warning'));
        expect(warningMessage.nativeElement.textContent).toContain('Veuillez choisir une AVATAR !');
    });

    it('should select an avatar on button click', () => {
        const avatarButton = fixture.debugElement.query(By.css('.avatar-container button'));
        avatarButton.nativeElement.setAttribute('avatar', component.avatarList[0]);
        avatarButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.selectedAvatar).toBe(component.avatarList[0]);
    });

    it('should navigate to lobby on valid form submission', () => {
        component.nameForm.setValue('ValidName');
        component.selectedAvatar = component.avatarList[0];
        component.goToLobby();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
