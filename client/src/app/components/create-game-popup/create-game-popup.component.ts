import { Component } from '@angular/core';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';

@Component({
    selector: 'app-create-game-popup',
    templateUrl: './create-game-popup.component.html',
    styleUrls: ['./create-game-popup.component.scss'],
    imports: [PokeballButtonComponent],
})
export class CreateGamePopupComponent {}
