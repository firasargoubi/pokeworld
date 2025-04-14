import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { MatchService } from '@app/services/match/match.service';
import { AVATAR_DATA } from '@common/consts/avatar-data.const';

@Component({
    selector: 'app-player-info-popup',
    templateUrl: './player-info-popup.component.html',
    styleUrls: ['./player-info-popup.component.scss'],
    imports: [CommonModule, ItemComponent],
    standalone: true,
})
export class PlayerInfoPopupComponent {
    @Input() playerIndex: number = 0;
    @Input() isVisible: boolean = false;
    avatarData = AVATAR_DATA;
    matchService: MatchService = inject(MatchService);
    @Input() closeButton: () => void = () => ({});
}
