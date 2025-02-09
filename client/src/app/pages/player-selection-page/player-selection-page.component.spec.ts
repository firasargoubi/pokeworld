import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerSelectionPageComponent } from './player-selection-page.component';
import { Avatars } from '@app/interfaces/avatars.enum';
import { dicePair } from '@app/interfaces/dice';
import { BONUS_POINTS, DEFAULT_STAT_POINTS } from '@app/interfaces/player';

describe('PlayerSelectionPageComponent', () => {
    let component: PlayerSelectionPageComponent;
    let fixture: ComponentFixture<PlayerSelectionPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, PlayerSelectionPageComponent],
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

        expect(component.isWarning('name')).toBeTrue();
    });

    it('should display warning message for unselected avatar', () => {
        component['isStartClicked'].set(true);
        component.selectedAvatar = Avatars.Default;
        fixture.detectChanges();

        expect(component.isWarning('avatar')).toBeTrue();
    });

    it('should return false for isWarning when form field is valid', () => {
        component.nameForm.setValue('ValidName');
        component['isStartClicked'].set(true);
        fixture.detectChanges();

        expect(component.isWarning('name')).toBeFalse();
    });

    it('should return false for isWarning when isStartClicked is false', () => {
        component.nameForm.setValue('ab');
        component['isStartClicked'].set(false);
        fixture.detectChanges();

        expect(component.isWarning('name')).toBeFalse();
    });

    it('should return false for isWarning when formField does not correspond to any known field', () => {
        component['isStartClicked'].set(true);
        fixture.detectChanges();

        expect(component.isWarning('unknownField')).toBeFalse();
    });

    it('should select an avatar', () => {
        const avatar = component.avatarList[0];
        component.handleAvatarSelection(avatar);

        expect(component.selectedAvatar).toBe(avatar);
    });

    it('should navigate to lobby on valid form submission', () => {
        component.nameForm.setValue('ValidName');
        component.selectedAvatar = component.avatarList[0];
        component.goToLobby();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/lobby']);
    });

    it('should not navigate to lobby on invalid form submission', () => {
        component.nameForm.setValue('');
        component.selectedAvatar = Avatars.Default;
        component.goToLobby();

        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should return correct score for stat category', () => {
        const score = component.getScore('life');
        expect(score).toBe(DEFAULT_STAT_POINTS + BONUS_POINTS);
    });

    it('should return correct bonus dice for stat category', () => {
        component.bonusForm.get('bonusDice')?.setValue(component.diceOptions.Option1.toString());
        const bonusDice = component.getBonusDice('attack');
        expect(bonusDice).toBe(dicePair[component.diceOptions.Option1]['attack']);
    });

    it('should return correct avatar button style', () => {
        const avatar = component.avatarList[0];
        component.selectedAvatar = avatar;
        const style = component.getAvatarBtnStyle(avatar);
        expect(style.background).toBe('blue');
        expect(style.text).toBe('CHOISI');
    });

    it('should return correct avatar button style for unselected avatar', () => {
        const avatar = component.avatarList[0];
        component.selectedAvatar = Avatars.Default;
        const style = component.getAvatarBtnStyle(avatar);
        expect(style.background).toBe('green');
        expect(style.text).toBe('CHOISIR');
    });

    it('should validate form correctly', () => {
        component.nameForm.setValue('ValidName');
        component.selectedAvatar = component.avatarList[0];
        expect(component.isFormValid()).toBeTrue();

        component.nameForm.setValue('');
        expect(component.isFormValid()).toBeFalse();

        component.nameForm.setValue('ValidName');
        component.selectedAvatar = Avatars.Default;
        expect(component.isFormValid()).toBeFalse();
    });

    it('should validate avatar choice correctly', () => {
        component.selectedAvatar = Avatars.Default;
        expect(component['isValidAvatarChoice']()).toBeFalse();

        component.selectedAvatar = component.avatarList[0];
        expect(component['isValidAvatarChoice']()).toBeTrue();
    });

    it('should return true for isBonusPoint when the stat category matches the bonus form value', () => {
        component.bonusForm.get('points')?.setValue('life');
        expect(component.isBonusPoint('life')).toBeTrue();
    });

    it('should return false for isBonusPoint when the stat category does not match the bonus form value', () => {
        component.bonusForm.get('points')?.setValue('life');
        expect(component.isBonusPoint('attack')).toBeFalse();
    });
});
