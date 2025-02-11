import { CommonModule, NgStyle } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { DiceOption, dicePair } from '@app/interfaces/dice';
import { BONUS_POINTS, DEFAULT_STAT_POINTS, Dice, PointStat } from '@app/interfaces/player';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, NgStyle, HeaderComponent, CommonModule],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
    readonly minLength = 3;
    readonly maxLength = 20;
    nameForm: FormControl = new FormControl('', [Validators.required, Validators.minLength(this.minLength), Validators.maxLength(this.maxLength)]);
    bonusForm: FormGroup = new FormGroup({
        points: new FormControl('life', [Validators.required]),
        bonusDice: new FormControl(DiceOption.Option1.toString(), [Validators.required]),
    });

    statFrench = {
        life: 'vie',
        speed: 'vitesse',
        attack: 'attaque',
        defense: 'defense',
    };
    statList = Object.keys(this.statFrench) as (keyof typeof this.statFrench)[];

    dice = Dice;
    diceOptions = DiceOption;

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

    getBonusDice(statCategory: PointStat): Dice | null {
        if (statCategory === 'attack' || statCategory === 'defense') {
            const diceOption = this.bonusForm.get('bonusDice')?.value;
            return dicePair[diceOption][statCategory];
        }
        return null;
    }

    getAvatarBtnStyle(avatar: Avatars) {
        if (avatar === this.selectedAvatar) {
            return {
                background: 'blue',
                text: 'CHOISI',
                class: 'selected',
            };
        } else {
            return {
                background: 'green',
                text: 'CHOISIR',
                class: 'unselected',
            };
        }
    }

    handleAvatarSelection(avatar: Avatars) {
        this.selectedAvatar = avatar;
    }

    isWarning(formField: string) {
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

    isFormValid() {
        return this.nameForm.valid && this.isValidAvatarChoice();
    }

    private isValidAvatarChoice() {
        return this.selectedAvatar !== Avatars.Default;
    }
}
