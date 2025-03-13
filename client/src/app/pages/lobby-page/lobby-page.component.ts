import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerCardComponent } from '@app/components/player-card/player-card.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';

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
    private router: Router = inject(Router);
    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);

    constructor() {
        if (this.lobbySocketsService.matchCode === '') {
            this.router.navigate(['/']);
        }
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
        this.lobbySocketsService.leaveMatch();
        this.router.navigate(['/']);
    }

    toggleLockRoom(): void {
        this.lobbySocketsService.toggleLockRoom(!this.isRoomLocked);
    }
}
