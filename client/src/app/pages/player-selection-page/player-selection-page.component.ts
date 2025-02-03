import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player, DEFAULT_PLAYER, BONUS_POINTS, DEFAULT_STAT_POINTS, PointStat } from '@app/interfaces/player';
import { GameDataService } from '@app/services/game-data/game-data.service';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule],
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
    currentBonusStat: PointStat | null = null;

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];

    constructor(gameDataService: GameDataService) {
        this.player = DEFAULT_PLAYER;
    }

    isBonusPoint(statCategory: PointStat) {
        return this.player[statCategory] > DEFAULT_STAT_POINTS;
    }

    addBonus(statCategory: PointStat) {
        if (this.currentBonusStat && this.currentBonusStat !== statCategory) {
            this.player[this.currentBonusStat] = DEFAULT_STAT_POINTS;
        }
        if (this.player[statCategory] === DEFAULT_STAT_POINTS) {
            this.player[statCategory] += BONUS_POINTS;
            this.currentBonusStat = statCategory;
        }
    }
}
