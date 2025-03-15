import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
import { DEBUG_GAMES, DEBUG_PLAYERS } from './debug-page.component.const';

@Component({
    selector: 'app-game-lobby',
    templateUrl: './debug-page.component.html',
    styleUrls: ['./debug-page.component.scss'],
    standalone: true,
    imports: [FormsModule, CommonModule],
})
export class DebugPageComponent {
    joinRoomCode: string = '';
    isAdmin: boolean = false;
    players$: Observable<Player[]>;
    isRoomLocked$: Observable<boolean>;
    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);

    constructor() {
        this.players$ = this.lobbySocketsService.players$;
        this.isRoomLocked$ = this.lobbySocketsService.roomLocked$;
    }

    get matchCode(): string | null {
        return this.lobbySocketsService.matchRoomCode;
    }

    createMatch(index: number): void {
        const game = DEBUG_GAMES[index];
        this.lobbySocketsService.createMatch(game).then((joinStatus) => {
            if (joinStatus) {
                this.isAdmin = true;
            }
        });
    }

    joinMatch(): void {
        this.lobbySocketsService.joinMatch(this.joinRoomCode).subscribe((joinStatus) => {
            if (joinStatus) {
                this.isAdmin = false;
            }
        });
        this.joinRoomCode = '';
    }

    leaveMatch(): void {
        this.lobbySocketsService.leaveMatch();
        this.isAdmin = false;
    }

    startMatch(): void {
        this.lobbySocketsService.startMatch();
    }

    lockRoom() {
        this.lobbySocketsService.changeLockStatus(true);
    }

    unlockRoom() {
        this.lobbySocketsService.changeLockStatus(false);
    }

    selectDebugPlayer(index: number) {
        const playerModifs = DEBUG_PLAYERS[index];
        this.lobbySocketsService.updatePlayer(playerModifs);
    }
}
