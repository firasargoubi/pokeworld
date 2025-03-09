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
    @Input() isViewer: boolean = false;
    @Input() isOwner: boolean = false;

    get avatarUrl(): string {
        return AVATAR_DATA[this.player.avatar]?.image;
    }
    get backgroundImageUrl(): string {
        return this.isViewer
            ? '../../../assets/images/menu/containers/orange/orange-scrare-body.png'
            : '../../../assets/images/menu/containers/blue/blue-scrare-body.png';
    }
    getHpBarWidth(): string {
        const currentHp = this.player.life;
        const minHp = 4;
        const maxHp = 6;
        switch (currentHp) {
            case minHp:
                return '55%';
            case maxHp:
                return '73%';
            default:
                return '0%';
        }
    }
}
