import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { POKE_BUTTON_DEFAULT_SCALE } from '@app/consts/ui.const';

@Component({
    selector: 'app-pokeball-button',
    templateUrl: './pokeball-button.component.html',
    styleUrls: ['./pokeball-button.component.scss'],
    imports: [CommonModule],
    standalone: true,
})
export class PokeballButtonComponent {
    @Input() buttonContent: string = 'BUTTON';
    @Input() delay: number = 0;
    @Input() onClickAction?: () => void;
    @Input() scale: number = POKE_BUTTON_DEFAULT_SCALE;

    isActive: boolean = false;

    onMouseDown(event: MouseEvent) {
        this.isActive = true;
        event.preventDefault();
    }

    onMouseUp() {
        if (this.isActive) {
            setTimeout(() => {
                this.isActive = false;
                if (this.onClickAction) {
                    this.onClickAction();
                }
            }, this.delay);
        }
    }

    onMouseLeave() {
        this.isActive = false;
    }
}
