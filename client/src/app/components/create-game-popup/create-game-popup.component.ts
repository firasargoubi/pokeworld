import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    gameMode: string = 'FFA';
    mapSize: string = '10';

    possibleModes = Object.keys(GameMode);
    possibleSizes = Object.keys(MapSize).filter((key) => Number(key));

    constructor(
        private router: Router, // private gameDataService: GameDataService,
    ) {}

    onSizeSelection(taille: string) {
        this.mapSize = taille;
    }

    onModeSelection(mode: string) {
        this.gameMode = mode;
    }

    onValiderSelection() {
        this.router.navigate(['/edit']);
        // const game = {
        //     _id: '456',
        //     name: 'Game 2',
        //     isVisible: true,
        //     description: 'Description 2',
        //     lastEdited: new Date(),
        //     mapData: {
        //         tiles: [],
        //         items: {} as Record<ItemType, Position[]>,
        //         size: MapSize.Large,
        //         gameMode: GameMode.CTF,
        //     },
        //     thumbnail: 'path',
        // };
    }
}
