import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { LobbyPlayerVisualData } from '@app/interfaces/lobby-visual-data';
import { PreferencesService } from '@app/services/preferences/preferences.service';
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
    private readonly preferencesService: PreferencesService = inject(PreferencesService);

    get partyBallImage(): string {
        return `url(${this.preferencesService.getPartyBallAsset()})`;
    }

    onAddBot() {
        this.addBot.emit();
    }
}
