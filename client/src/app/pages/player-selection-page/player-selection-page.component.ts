import { CommonModule, NgStyle } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { BONUS_POINTS, DEFAULT_STAT_POINTS, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/consts/default-player';
import { BonusDice, DiceType } from '@app/consts/dice';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { StatType } from '@app/consts/player-stats.enum';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, NgStyle, HeaderComponent, CommonModule],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
    nameForm: FormControl = new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]);
    bonusPointsForm: FormControl = new FormControl(StatType.Life, [Validators.required]);
    maxNameLength = MAX_NAME_LENGTH;

    diceType = DiceType;
    statType = StatType;
    bonusDice: BonusDice = { attack: DiceType.D4, defense: DiceType.D6 };

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];
    selectedAvatar: Avatars = Avatars.Default;

    private isStartClicked: WritableSignal<boolean> = signal(false);
    private router: Router = inject(Router);

    getScore(statCategory: StatType) {
        return this.isBonusPoint(statCategory) ? DEFAULT_STAT_POINTS + BONUS_POINTS : DEFAULT_STAT_POINTS;
    }

    isBonusPoint(statCategory: StatType) {
        return this.bonusPointsForm?.value === statCategory;
    }

    toggleBonusDice(): void {
        [this.bonusDice.attack, this.bonusDice.defense] = [this.bonusDice.defense, this.bonusDice.attack];
    }

    getAvatarBtnStyle(avatar: Avatars) {
        if (avatar === this.selectedAvatar) {
            return {
                background: 'avatar-selected',
                text: 'CHOISI',
                class: 'selected',
            };
        } else {
            return {
                background: 'avatar-unselected',
                text: 'CHOISIR',
                class: 'unselected',
            };
        }
    }

    handleAvatarSelection(avatar: Avatars) {
        this.selectedAvatar = avatar;
    }

    needsWarning(formField: string) {
        if (formField === 'name') {
            return !this.nameForm.valid && this.isStartClicked();
        } else if (formField === 'avatar') {
            return !this.isValidAvatarChoice() && this.isStartClicked();
        }
        return false;
    }

    goToLobby() {
        this.isStartClicked.set(true);
        if (this.isFormValid()) {
            this.router.navigate(['/lobby']);
        }
    }

    goToCreatPage() {
        this.router.navigate(['/create']);
    }

    isFormValid() {
        return this.nameForm.valid && this.isValidAvatarChoice();
    }

    private isValidAvatarChoice() {
        return this.selectedAvatar !== Avatars.Default;
    }
}
