import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player, DEFAULT_PLAYER, BONUS_POINTS, DEFAULT_STAT_POINTS, PointStat } from '@app/interfaces/player';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule, NgStyle],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
    gameDataService: GameDataService;
    player: Player;
    name = new FormControl('', [Validators.required]);

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

    constructor(gameDataService: GameDataService) {
        this.player = DEFAULT_PLAYER;
    }

    isBonusPoint(statCategory: PointStat) {
        return this.player[statCategory] > DEFAULT_STAT_POINTS;
    }

    addBonus(statCategory: PointStat) {
        if (this.selectedBonusPoint && this.selectedBonusPoint !== statCategory) {
            this.player[this.selectedBonusPoint] = DEFAULT_STAT_POINTS;
        }
        if (this.player[statCategory] === DEFAULT_STAT_POINTS) {
            this.player[statCategory] += BONUS_POINTS;
            this.selectedBonusPoint = statCategory;
        }
    }

    swapDice() {
        [this.player.bonusDice.attack, this.player.bonusDice.defense] = [this.player.bonusDice.defense, this.player.bonusDice.attack];
    }

    getSelectBtnStyle(avatar: Avatars) {
        const locked = false;
        if (avatar === this.player.avatar) {
            return {
                background: 'blue',
                text: 'CHOISI',
            };
        } else if (locked) {
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

    handleSelection(event: MouseEvent) {
        const btn = event.target as HTMLElement;
        if (btn.tagName === 'BUTTON') {
            this.player.avatar = btn.getAttribute('avatar') as Avatars;
        }
    }
}
