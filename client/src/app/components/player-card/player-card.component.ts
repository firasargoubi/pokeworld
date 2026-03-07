import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LobbyPlayerVisualData } from '@app/interfaces/lobby-visual-data';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-player-card',
    templateUrl: './player-card.component.html',
    styleUrls: ['./player-card.component.scss'],
    imports: [CommonModule, TranslateModule],
})
export class PlayerCardComponent {
    @Input() player: LobbyPlayerVisualData;
    @Input() displayKickButton: boolean = false;
    @Input() onClick: () => void;
    @Output() addBot = new EventEmitter<void>();

    onAddBot() {
        this.addBot.emit();
    }
}
