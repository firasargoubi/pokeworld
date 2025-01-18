import { Component } from '@angular/core';
import { BoardComponent } from '@app/components/board/board.component';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [BoardComponent],
})
export class EditPageComponent {}
