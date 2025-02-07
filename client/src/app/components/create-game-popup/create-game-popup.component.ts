import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameMode } from '@common/game-mode.enum';
import { MapSize } from '@common/map-size.enum';

@Component({
    selector: 'app-create-game-popup',
    templateUrl: './create-game-popup.component.html',
    styleUrls: ['./create-game-popup.component.scss'],
    imports: [PokeballButtonComponent, NgClass],
})
export class CreateGamePopupComponent {
    gameMode: keyof typeof GameMode = 'FFA';
    mapSize: keyof typeof MapSize = 'Small';

    gameDataService: GameDataService = inject(GameDataService);

    possibleModes = Object.entries(GameMode).map(([key, value]) => ({ key, value }));
    possibleSizes = Object.entries(MapSize)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => ({ key, value: value as number }));

    constructor(private router: Router) {}

    onSizeSelection(sizeKey: string) {
        this.mapSize = sizeKey as keyof typeof MapSize;
    }

    onModeSelection(modeKey: string) {
        this.gameMode = modeKey as keyof typeof GameMode;
    }

    onValiderSelection() {
        this.gameDataService.createGameData(MapSize[this.mapSize], GameMode[this.gameMode]);
        this.router.navigate(['/edit']);
    }
}
