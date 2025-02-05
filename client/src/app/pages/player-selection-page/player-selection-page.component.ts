import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player, DEFAULT_PLAYER, BONUS_POINTS, DEFAULT_STAT_POINTS, PointStat, Dice } from '@app/interfaces/player';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, NgStyle],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
    router: Router;
    gameDataService: GameDataService;
    player: Player;
    nameForm: FormControl;
    bonusForm: FormGroup;

    statFrench = {
        life: 'vie',
        speed: 'vitesse',
        attack: 'attaque',
        defense: 'defense',
    };
    statList = Object.keys(this.statFrench) as (keyof typeof this.statFrench)[];
    dice = Dice;

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];

    selectedBonusPoint: PointStat | null = null;
    isStartClicked: boolean = false;

    constructor(gameDataService: GameDataService, router: Router) {
        this.router = router;
        this.player = DEFAULT_PLAYER;
        this.initializeForm();
    }

    initializeForm() {
        /* name form */
        const MIN_LENGTH = 3;
        const MAX_LENGTH = 20;
        this.nameForm = new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH), Validators.maxLength(MAX_LENGTH)]);

        /* bonus form */
        this.bonusForm = new FormGroup({
            points: new FormControl('', [Validators.required]),
            attackDice: new FormControl('', [Validators.required]),
            defenseDice: new FormControl('', [Validators.required]),
        });
    }

    isBonusPoint(statCategory: PointStat) {
        return this.bonusForm.get('points')?.value === statCategory;
    }

    getScore(statCategory: PointStat) {
        return this.isBonusPoint(statCategory) ? DEFAULT_STAT_POINTS + BONUS_POINTS : DEFAULT_STAT_POINTS;
    }

    getBonusDice(statCategory: PointStat) {
        if (statCategory === 'attack') {
            return this.bonusForm.get('attackDice')?.value;
        } else if (statCategory === 'defense') {
            return this.bonusForm.get('defenseDice')?.value;
        }
        return null;
    }

    getSelectBtnStyle(avatar: Avatars) {
        if (avatar === this.player.avatar) {
            return {
                background: 'blue',
                text: 'CHOISI',
            };
        } else if (this.isAvatarLocked(avatar)) {
            return {
                background: 'red',
                text: 'VERROUILLE',
            };
        } else {
            return {
                background: 'green',
                text: 'CHOISIR',
            };
        }
    }

    getSelectedAvatar() {
        return this.player.avatar;
    }

    isAvatarLocked(avatar: Avatars) {
        const excludedAvatars = [Avatars.Avatar5, Avatars.Avatar6]; // temp
        return excludedAvatars.includes(avatar);
    }

    handleSelection(event: MouseEvent) {
        const btn = event.target as HTMLElement;
        if (btn.tagName === 'BUTTON') {
            const selectedAvatar: Avatars = btn.getAttribute('avatar') as Avatars;
            if (!this.isAvatarLocked(selectedAvatar)) {
                this.player.avatar = selectedAvatar;
            }
        }
    }

    isWarning(form: FormControl | FormGroup, errorType: string) {
        return form.hasError(errorType) && this.isStartClicked;
    }

    isValidAvatarChoice() {
        return this.getSelectedAvatar() !== Avatars.Default;
    }

    isValidDiceChoice() {
        return this.bonusForm.get('attackDice')?.touched && this.bonusForm.get('attackDice')?.value !== this.bonusForm.get('defenseDice')?.value;
    }

    isAvatarWarning() {
        return !this.isValidAvatarChoice() && this.isStartClicked;
    }

    isFormValid() {
        return this.nameForm.valid && this.bonusForm.valid && this.isValidDiceChoice() && this.isValidAvatarChoice();
    }

    goToLobby() {
        this.isStartClicked = true;
        if (this.isFormValid() && confirm('Es-tu sur de tes choix ?')) {
            // save data in player
            this.router.navigate(['/']); // temp
        }
    }
}
