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

    defaultImageSrc: string = '/assets/images/menu/buttons/party-ball.png';
    pressedImageSrc: string = '/assets/images/menu/buttons/party-ball-sel.png';
    imageSrc: string = this.defaultImageSrc;

    onMouseDown(): void {
        this.imageSrc = this.pressedImageSrc;

        setTimeout(() => {
            this.imageSrc = this.defaultImageSrc;
            // button logic
        }, this.delay);
    }
}
