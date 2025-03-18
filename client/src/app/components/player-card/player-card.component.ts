import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { Player } from '@common/interfaces/player';
import { DEFAULT_PLAYER } from '@common/consts/player.const';

@Component({
    selector: 'app-player-card',
    templateUrl: './player-card.component.html',
    styleUrls: ['./player-card.component.scss'],
    imports: [CommonModule],
})
export class PlayerCardComponent {
    @Input() player: Player = structuredClone(DEFAULT_PLAYER);
    @Input() isAdmin: boolean = false;
    @Input() isSelfPlayer: boolean = false;
    @Input() isDisconeected: boolean = false;
    @Input() displayBanButton: boolean = false;
    @Input() onClick: () => void;

    get avatarUrl(): string {
        return AVATAR_DATA[this.player.avatar].htmlImageCentred;
    }
}
