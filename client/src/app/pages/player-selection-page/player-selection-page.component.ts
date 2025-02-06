import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player, DEFAULT_PLAYER, BONUS_POINTS, DEFAULT_STAT_POINTS, PointStat, Dice, PlayerFormError } from '@app/interfaces/player';
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
    formError = PlayerFormError;

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];

    selectedBonusPoint: PointStat | null = null;
    isStartClicked: boolean = false;

    constructor(gameDataService: GameDataService, router: Router) {
        this.router = router;
        this.player = DEFAULT_PLAYER;
        this.initializeForms();
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

    getAvatarBtnStyle(avatar: Avatars) {
        if (avatar === this.player.avatar) {
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
        const btn = event.target as HTMLElement;
        if (btn.tagName === 'BUTTON') {
            const selectedAvatar: Avatars = btn.getAttribute('avatar') as Avatars;
            this.player.avatar = selectedAvatar;
        }
    }

    isWarning(formError: PlayerFormError) {
        let isValidField: boolean;
        switch (formError) {
            case PlayerFormError.Name: {
                isValidField = this.nameForm.valid;
                break;
            }
            case PlayerFormError.BonusDice: {
                isValidField = this.isValidDiceChoice();
                break;
            }
            case PlayerFormError.Avatar: {
                isValidField = this.isValidAvatarChoice();
                break;
            }
            default: {
                isValidField = false;
            }
        }
        return !isValidField && this.isStartClicked;
    }

    goToLobby() {
        this.isStartClicked = true;
        if (this.isFormValid()) {
            // save data in player
            confirm('Es-tu sur de tes choix ?');
            this.router.navigate(['/']); // temp
        }
    }

    isFormValid() {
        return this.nameForm.valid && this.isValidSelections();
    }

    private initializeForms() {
        const MIN_LENGTH = 3;
        const MAX_LENGTH = 20;
        this.nameForm = new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH), Validators.maxLength(MAX_LENGTH)]);

        this.bonusForm = new FormGroup({
            points: new FormControl('life', [Validators.required]),
            attackDice: new FormControl(Dice.D4, [Validators.required]),
            defenseDice: new FormControl(Dice.D6, [Validators.required]),
        });
    }

    private isValidSelections() {
        return this.isValidAvatarChoice() && this.isValidDiceChoice();
    }

    private isValidAvatarChoice() {
        return this.player.avatar !== Avatars.Default;
    }

    private isValidDiceChoice() {
        return this.bonusForm.get('attackDice')?.value !== this.bonusForm.get('defenseDice')?.value;
    }
}
