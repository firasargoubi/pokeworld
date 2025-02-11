import { CommonModule, NgStyle } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { BONUS_POINTS, DEFAULT_STAT_POINTS, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/consts/default-player';
import { BonusDice, DICE_PAIR, DiceType } from '@app/consts/dice';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { PointStat, statFrench } from '@app/interfaces/player';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, NgStyle, HeaderComponent, CommonModule],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
    nameForm: FormControl = new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]);
    bonusForm: FormGroup = new FormGroup({
        points: new FormControl('life', [Validators.required]),
        bonusDice: new FormControl(BonusDice.Option1, [Validators.required]),
    });
    maxNameLength = MAX_NAME_LENGTH;

    statFrench = statFrench;
    statList = Object.keys(this.statFrench) as (keyof typeof this.statFrench)[];

    diceType = DiceType;
    bonusDice = BonusDice;

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];
    selectedAvatar: Avatars = Avatars.Default;

    private isStartClicked: WritableSignal<boolean> = signal(false);
    private router: Router = inject(Router);

    getScore(statCategory: PointStat) {
        return this.isBonusPoint(statCategory) ? DEFAULT_STAT_POINTS + BONUS_POINTS : DEFAULT_STAT_POINTS;
    }

    isBonusPoint(statCategory: PointStat) {
        return this.bonusForm.get('points')?.value === statCategory;
    }

    isBonus6Dice(statCategory: PointStat): boolean {
        if (statCategory === 'attack' || statCategory === 'defense') {
            const diceOption = this.bonusForm.get('bonusDice')?.value;
            return DICE_PAIR[diceOption][statCategory] === DiceType.D6;
        }
        return false;
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
