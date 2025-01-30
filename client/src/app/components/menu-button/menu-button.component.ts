import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './menu-button.component.html',
    styleUrls: ['./menu-button.component.scss'],
})
export class MenuButtonComponent {
    @Input() containerClass: string = 'container orange-container';
    @Input() spriteImage: string = '/assets/images/menu/pokemon/normal/charizard.png';
    @Input() textContent: string = '';
    @Input() routePath!: string;

    constructor(private router: Router) {}

    navigateWithDelay() {
        const delay = 200;
        setTimeout(() => {
            this.router.navigate([this.routePath]);
        }, delay);
    }
}
