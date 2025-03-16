import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerCardComponent } from '@app/components/player-card/player-card.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
import { PopupService } from '@app/services/popup/popup.service';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    imports: [CommonModule, HeaderComponent, PlayerCardComponent, PokeballButtonComponent],
    standalone: true,
})
export class LobbyPageComponent {
    accessCode: string = '';
    isAdmin: boolean = false;
    players$: Observable<Player[]>;
    isRoomLocked: boolean;
    private popupService: PopupService = inject(PopupService);
    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);

    constructor() {
        this.players$ = this.lobbySocketsService.players$;
        this.lobbySocketsService.roomLocked$.subscribe((isRoomLocked) => {
            this.isRoomLocked = isRoomLocked;
        });
    }

    get matchCode(): string | null {
        return this.lobbySocketsService.matchRoomCode;
    }

    startMatchButton(): void {
        this.lobbySocketsService.startMatch();
    }

    leaveLobbyButton(): void {
        this.popupService.showPopup('Voulez-vous vraiment quitter ?', true, this.lobbySocketsService.leaveMatch.bind(this.lobbySocketsService));
    }

    toggleLockRoom(): void {
        this.lobbySocketsService.changeLockStatus(!this.isRoomLocked);
    }

    kickPlayer(playerId: string): void {
        this.lobbySocketsService.kickPlayer(playerId);
    }
}
