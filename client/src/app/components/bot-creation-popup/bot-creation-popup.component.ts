import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { PlayerType } from '@common/interfaces/player-data';

@Component({
    selector: 'app-create-bot-popup',
    templateUrl: './bot-creation-popup.component.html',
    styleUrls: ['./bot-creation-popup.component.scss'],
    imports: [PokeballButtonComponent, NgClass],
    standalone: true,
})
export class CreateBotPopupComponent {
    @Output() botTypeSelected = new EventEmitter<PlayerType>();
    selectedProfile: PlayerType = PlayerType.BotAggressive;
    playerType = PlayerType;

    onProfileSelection(profile: PlayerType) {
        this.selectedProfile = profile;
    }

    onValiderSelection() {
        this.botTypeSelected.emit(this.selectedProfile);
    }
}
