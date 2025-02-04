import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { GameMode } from '@common/game-mode.enum';
import { MapSize } from '@common/map-size.enum';

@Component({
    selector: 'app-create-game-popup',
    templateUrl: './create-game-popup.component.html',
    styleUrls: ['./create-game-popup.component.scss'],
    imports: [PokeballButtonComponent, NgClass],
})
export class CreateGamePopupComponent {
    gameMode: string;
    mapSize: string;

    possibleModes = Object.keys(GameMode);
    possibleSizes = Object.keys(MapSize).filter((key) => Number(key));

    onSizeSelection(taille: string) {
        this.mapSize = taille;
    }

    onModeSelection(mode: string) {
        this.gameMode = mode;
    }

    onValiderSelection() {}
}
