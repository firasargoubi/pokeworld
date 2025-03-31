import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuButtonComponent } from '@app/components/menu-button/menu-button.component';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.scss'],
    imports: [MenuButtonComponent, RouterModule],
})
export class MenuPageComponent {
    pageEndpoint = PageEndpoint;
}
