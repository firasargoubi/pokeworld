import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-pokeball-button',
    templateUrl: './pokeball-button.component.html',
    styleUrls: ['./pokeball-button.component.scss'],
    standalone: true,
})
export class PokeballButtonComponent {
    @Input() buttonContent: string = 'BUTTON';
    @Input() delay: number;
    @Input() onClickAction?: () => void;

    defaultPokeballImageSrc: string = '/assets/images/menu/buttons/poke-button/party-ball.png';
    pressedPokeballImageSrc: string = '/assets/images/menu/buttons/poke-button/party-ball-sel.png';

    defaultContentImageSrc: string = '/assets/images/menu/buttons/poke-button/button-container-borderless.png';
    pressedContentImageSrc: string = '/assets/images/menu/buttons/poke-button/button-container-borderless-active.png';

    defaultBorderImageSrc: string = '/assets/images/menu/buttons/poke-button/button-border.png';
    pressedBorderImageSrc: string = '/assets/images/menu/buttons/poke-button/button-border-active.png';

    pokeballImageSrc: string = this.defaultPokeballImageSrc;
    borderImageSrc: string = this.defaultBorderImageSrc;
    contentImageSrc: string = this.defaultContentImageSrc;

    onMouseDown(): void {
        this.pokeballImageSrc = this.pressedPokeballImageSrc;
        this.borderImageSrc = this.pressedBorderImageSrc;
        this.contentImageSrc = this.pressedContentImageSrc;
    }

    onMouseUp(): void {
        setTimeout(() => {
            this.pokeballImageSrc = this.defaultPokeballImageSrc;
            this.borderImageSrc = this.defaultBorderImageSrc;
            this.contentImageSrc = this.defaultContentImageSrc;

            if (this.onClickAction) {
                this.onClickAction(); // Vérifie si la fonction est définie avant de l'exécuter
            }
        }, this.delay);
    }
}
