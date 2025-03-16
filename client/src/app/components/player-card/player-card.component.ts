import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { DEFAULT_PLAYER } from '@common/const/default-player.const';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-card',
    templateUrl: './player-card.component.html',
    styleUrls: ['./player-card.component.scss'],
    imports: [CommonModule],
})
export class PlayerCardComponent {
    @Input() player: Player = DEFAULT_PLAYER;
    @Input() isAdmin: boolean = false;
    @Input() isSelfPlayer: boolean = false;
    @Input() isDisconeected: boolean = false;
    @Input() displayBanButton: boolean = false;
    @Input() onClick: () => void;

    avatarsData = AVATAR_DATA;
}
