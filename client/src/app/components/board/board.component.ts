import { Component } from '@angular/core';
import { BoardVisualService } from '@app/services/board-visual.service';

@Component({
    selector: 'app-board',
    standalone: true,
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
    constructor(public boardVisualService: BoardVisualService) {}
}
