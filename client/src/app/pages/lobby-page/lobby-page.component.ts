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
    selector: 'app-game-lobby',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    imports: [CommonModule, HeaderComponent, PlayerCardComponent, PokeballButtonComponent],
    standalone: true,
})
export class LobbyPageComponent {
    accessCode: string = '';
    players: Player[] = [];
    players$: Observable<Player[]>;
    isLocked: boolean = false;
    isRoomLocked$: Observable<boolean>;
    private router: Router = inject(Router);
    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);

    constructor() {
        this.players$ = this.lobbySocketsService.players$;
        this.isRoomLocked$ = this.lobbySocketsService.roomLocked$;
    }

    get matchCode(): string | null {
        return this.lobbySocketsService.matchRoomCode;
    }

    startGame(): void {
        this.router.navigate(['/']);
    }

    leaveLobby(): void {
        this.lobbySocketsService.leaveGame();
        this.router.navigate(['/']);
    }

    lockRoom(): void {
        this.lobbySocketsService.toggleLockRoom(true);
    }

    unlockRoom(): void {
        this.lobbySocketsService.toggleLockRoom(false);
    }
}
