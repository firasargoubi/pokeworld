import { Component, Input } from '@angular/core';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-player-card',
    templateUrl: './player-card.component.html',
    styleUrls: ['./player-card.component.scss'],
})
export class PlayerCardComponent {
    @Input() player!: Player;

    get avatarUrl(): string {
        return AVATAR_DATA[this.player.avatar]?.image || 'assets/avatars/default.png';
    }
}
