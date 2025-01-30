import { Component } from '@angular/core';
import { BoardComponent } from '@app/components/board/board.component';
import { GameDataService } from '@app/services/game-data.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [BoardComponent],
})
export class EditPageComponent {
    constructor(public gameDataService: GameDataService) {}
}
