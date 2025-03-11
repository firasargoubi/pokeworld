import { Component, Input } from '@angular/core';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-card',
    templateUrl: './player-card.component.html',
    styleUrls: ['./player-card.component.scss'],
})
export class PlayerCardComponent {
    @Input() player!: Player;
    @Input() isViewer: boolean = false;

    get avatarUrl(): string {
        return AVATAR_DATA[this.player.avatar]?.image;
    }
    get backgroundImageUrl(): string {
        return this.isViewer
            ? '../../../assets/images/menu/containers/player-card/orange-container.png'
            : '../../../assets/images/menu/containers/player-card/dark-blue-container.png';
    }
    getHpBarWidth(): string {
        const currentHp = this.player.playerStats.health;
        const minHp = 4;
        const maxHp = 6;
        switch (currentHp) {
            case minHp:
                return '55%';
            case maxHp:
                return '74%';
            default:
                return '0%';
        }
    }
}
