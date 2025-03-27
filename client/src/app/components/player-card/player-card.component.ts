import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-player-card',
    templateUrl: './player-card.component.html',
    styleUrls: ['./player-card.component.scss'],
    imports: [CommonModule],
})
export class PlayerCardComponent {
    @Input() isHost: boolean = false;
    @Input() isSelfPlayer: boolean = false;
    @Input() isDisconnected: boolean = false;
    @Input() name: string = '';
    @Input() health: number = 0;
    @Input() displayBanButton: boolean = false;
    @Input() avatarImage: string = '';
    @Input() onClick: () => void;
}
