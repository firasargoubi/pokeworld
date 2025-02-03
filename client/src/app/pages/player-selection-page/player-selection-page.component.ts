import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player, DEFAULT_PLAYER, BONUS_POINTS, DEFAULT_STAT_POINTS, PointStat } from '@app/interfaces/player';
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
    // eslint-disable-next-line no-magic-numbers
    MIN_LENGTH = 3;
    // eslint-disable-next-line no-magic-numbers
    MAX_LENGTH = 20;
    nameForm = new FormControl('', [Validators.required, Validators.minLength(this.MIN_LENGTH), Validators.maxLength(this.MAX_LENGTH)]);

    statFrench = {
        life: 'vie',
        speed: 'vitesse',
        attack: 'attaque',
        defense: 'defense',
    };
    statList = Object.keys(this.statFrench) as (keyof typeof this.statFrench)[];

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];

    selectedBonusPoint: PointStat | null = null;

    constructor(gameDataService: GameDataService, router: Router) {
        this.router = router;
        this.player = DEFAULT_PLAYER;
    }

    isBonusPoint(statCategory: PointStat) {
        return this.player[statCategory] > DEFAULT_STAT_POINTS;
    }

    addBonus(statCategory: PointStat) {
        if (!this.selectedBonusPoint) {
            this.selectedBonusPoint = statCategory;
            this.player[statCategory] += BONUS_POINTS;
        } else if (statCategory !== this.selectedBonusPoint) {
            this.player[statCategory] += BONUS_POINTS;
            this.player[this.selectedBonusPoint] -= BONUS_POINTS;
            this.selectedBonusPoint = statCategory;
        }
    }

    swapDice() {
        [this.player.bonusDice.attack, this.player.bonusDice.defense] = [this.player.bonusDice.defense, this.player.bonusDice.attack];
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

    canGoToLobby() {
        return this.nameForm.valid && this.selectedBonusPoint !== null && this.player.avatar !== Avatars.Default;
    }
    goToLobby() {
        if (this.canGoToLobby() && confirm('Es-tu sur de tes choix ?')) {
            this.router.navigate(['/']); // temp
        }
    }
}
