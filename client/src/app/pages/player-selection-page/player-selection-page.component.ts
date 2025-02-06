import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { BONUS_POINTS, DEFAULT_STAT_POINTS, PointStat, Dice } from '@app/interfaces/player';
import { dicePair, DiceOption } from '@app/interfaces/dice';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, NgStyle],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
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

    nameForm: FormControl;
    bonusForm: FormGroup;

    private isStartClicked: WritableSignal<boolean> = signal(false);
    private router: Router;

    constructor(router: Router) {
        this.router = router;
        this.initializeForms();
    }

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
            };
        } else {
            return {
                background: 'green',
                text: 'CHOISIR',
            };
        }
    }

    handleAvatarSelection(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const isSelectButton = target.tagName === 'BUTTON';
        if (isSelectButton) {
            const newAvatar: Avatars = target.getAttribute('avatar') as Avatars;
            this.selectedAvatar = newAvatar;
        }
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
            confirm('Es-tu sur de tes choix ?');
            this.router.navigate(['/']); // temp
        }
    }

    isFormValid() {
        return this.nameForm.valid && this.isValidAvatarChoice();
    }

    private initializeForms() {
        const MIN_LENGTH = 3;
        const MAX_LENGTH = 20;
        this.nameForm = new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH), Validators.maxLength(MAX_LENGTH)]);

        this.bonusForm = new FormGroup({
            points: new FormControl('life', [Validators.required]),
            bonusDice: new FormControl(DiceOption.Option1.toString(), [Validators.required]),
        });
    }

    private isValidAvatarChoice() {
        return this.selectedAvatar !== Avatars.Default;
    }
}
