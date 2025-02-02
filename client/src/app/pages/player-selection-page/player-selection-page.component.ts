import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVATAR_DATA } from '@app/interfaces/avatars';
import { Avatars } from '@app/interfaces/avatars.enum';
import { DEFAULT_STAT_POINTS } from '@app/interfaces/player';
import { GameDataService } from '@app/services/game-data/game-data.service';

@Component({
    selector: 'app-player-selection-page',
    imports: [ReactiveFormsModule],
    templateUrl: './player-selection-page.component.html',
    styleUrl: './player-selection-page.component.scss',
})
export class PlayerSelectionPageComponent {
    gameDataService: GameDataService;
    name = new FormControl('', [Validators.required]);
    defaultStatPoint = DEFAULT_STAT_POINTS;

    avatarData = AVATAR_DATA;
    avatarList = Object.keys(AVATAR_DATA) as Avatars[];

    constructor(gameDataService: GameDataService) {
        this.gameDataService = gameDataService;
    }
}
