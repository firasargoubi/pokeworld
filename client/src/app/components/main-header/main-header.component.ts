import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-main-header',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './main-header.component.html',
    styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
    @Input() routerLink: string = '/';
    @Input() imgSrc: string = '/assets/images/menu/headers/header-1.png';
    @Input() title: string = '<';
}
