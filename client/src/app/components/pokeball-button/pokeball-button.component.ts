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

    defaultImageSrc: string = '/assets/images/menu/buttons/poke-button/party-ball.png';
    pressedImageSrc: string = '/assets/images/menu/buttons/poke-button/party-ball-sel.png';

    defaultContentImageSrc: string = '/assets/images/menu/buttons/poke-button/button-container-borderless.png';
    pressedContentImageSrc: string = '/assets/images/menu/buttons/poke-button/button-container-borderless-active.png';

    defaultBorderImageSrc: string = '/assets/images/menu/buttons/poke-button/button-border.png';
    pressedBorderImageSrc: string = '/assets/images/menu/buttons/poke-button/button-border-active.png';

    pokeballImageSrc: string = this.defaultImageSrc;
    borderImageSrc: string = this.defaultBorderImageSrc;
    contentImageSrc: string = this.defaultContentImageSrc;

    onMouseDown(): void {
        this.pokeballImageSrc = this.pressedImageSrc;
        this.borderImageSrc = this.pressedBorderImageSrc;
        this.contentImageSrc = this.pressedContentImageSrc;

        const startTimer = () => {
            setTimeout(() => {
                this.pokeballImageSrc = this.defaultImageSrc;
                this.borderImageSrc = this.defaultBorderImageSrc;
                this.contentImageSrc = this.defaultContentImageSrc;

                // button logic
            }, this.delay);

            document.removeEventListener('mouseup', startTimer);
        };

        document.addEventListener('mouseup', startTimer);
    }
}
