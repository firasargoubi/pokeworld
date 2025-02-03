import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player, DEFAULT_PLAYER, BONUS_POINTS } from '@app/interfaces/player';
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

    bonusPoint = BONUS_POINTS;
    defaultStatPoint = 4; // temp

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA).slice(1) as Avatars[];

    constructor(gameDataService: GameDataService) {
        this.player = DEFAULT_PLAYER;
    }
}
