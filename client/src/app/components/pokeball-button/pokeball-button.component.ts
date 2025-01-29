import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-pokeball-button',
    templateUrl: './pokeball-button.component.html',
    styleUrls: ['./pokeball-button.component.css'],
    standalone: true,
})
export class PokeballButtonComponent {
    @Input() buttonContent: string = 'BUTTON';
    @Input() delay: number;

    defaultImageSrc: string = 'assets/ui/buttons/partyBall.png';
    pressedImageSrc: string = 'assets/ui/buttons/partyBallSel.PNG';
    imageSrc: string = this.defaultImageSrc;

    onMouseDown(): void {
        this.imageSrc = this.pressedImageSrc;

        setTimeout(() => {
            this.imageSrc = this.defaultImageSrc;
            // button logic
        }, this.delay);
    }
}
