import { Component } from '@angular/core';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.scss'],
    imports: [MenuButtonComponent],
})
export class MenuPageComponent {}
