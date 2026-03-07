import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [TranslateModule],
})
export class HeaderComponent {
    @Input() title: string;
    @Input() stepNumber: string;
    @Input() onClick: () => void;
}
