import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BONUS_POINTS, DEFAULT_STAT_POINTS } from '@app/consts/default-player';
import { DiceType } from '@app/consts/dice';
import { StatType } from '@app/consts/player-stats.enum';
import { Avatars } from '@app/interfaces/avatars.enum';
import { PlayerSelectionPageComponent } from './player-selection-page.component';

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
        const bonusPointsForm = component.bonusPointsForm;

        expect(nameInput.value).toBe('');
        expect(nameInput.valid).toBeFalse();
        expect(bonusPointsForm?.value).toBe(StatType.Life);
    });

    it('should display warning message for invalid name', () => {
        component['isStartClicked'].set(true);
        component.nameForm.setValue('ab');
        fixture.detectChanges();

        expect(component.needsWarning('name')).toBeTrue();
    });

    it('should display warning message for unselected avatar', () => {
        component['isStartClicked'].set(true);
        component.selectedAvatar = Avatars.Default;
        fixture.detectChanges();

        expect(component.needsWarning('avatar')).toBeTrue();
    });

    it('should return false for needsWarning when form field is valid', () => {
        component.nameForm.setValue('ValidName');
        component['isStartClicked'].set(true);
        fixture.detectChanges();

        expect(component.needsWarning('name')).toBeFalse();
    });

    it('should return false for needsWarning when isStartClicked is false', () => {
        component.nameForm.setValue('ab');
        component['isStartClicked'].set(false);
        fixture.detectChanges();

        expect(component.needsWarning('name')).toBeFalse();
    });

    it('should return false for needsWarning when formField does not correspond to any known field', () => {
        component['isStartClicked'].set(true);
        fixture.detectChanges();

        expect(component.needsWarning('unknownField')).toBeFalse();
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
        component.bonusPointsForm.setValue(StatType.Life);

        let score = component.getScore(StatType.Life);
        expect(score).toBe(DEFAULT_STAT_POINTS + BONUS_POINTS);

        score = component.getScore(StatType.Attack);
        expect(score).toBe(DEFAULT_STAT_POINTS);
    });

    it('should return correct avatar button style', () => {
        const avatar = component.avatarList[0];
        component.selectedAvatar = avatar;
        const style = component.getAvatarBtnStyle(avatar);
        expect(style.class).toBe('selected');
    });

    it('should return correct avatar button style for unselected avatar', () => {
        const avatar = component.avatarList[0];
        component.selectedAvatar = Avatars.Default;
        const style = component.getAvatarBtnStyle(avatar);
        expect(style.class).toBe('unselected');
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
        component.bonusPointsForm?.setValue(StatType.Life);
        expect(component.isBonusPoint(StatType.Life)).toBeTrue();
    });

    it('should return false for isBonusPoint when the stat category does not match the bonus form value', () => {
        component.bonusPointsForm?.setValue(StatType.Life);
        expect(component.isBonusPoint(StatType.Attack)).toBeFalse();
    });

    it('should toggle bonus dice correctly', () => {
        component.bonusDice.attack = DiceType.D4;
        component.bonusDice.defense = DiceType.D6;
        component.toggleBonusDice();

        expect(component.bonusDice.attack).toBe(DiceType.D6);
        expect(component.bonusDice.defense).toBe(DiceType.D4);

        component.toggleBonusDice();

        expect(component.bonusDice.attack).toBe(DiceType.D4);
        expect(component.bonusDice.defense).toBe(DiceType.D6);
    });

    it('should navigate to create page when goToCreatPage is called', () => {
        component.goToCreatPage();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/create']);
    });
});
