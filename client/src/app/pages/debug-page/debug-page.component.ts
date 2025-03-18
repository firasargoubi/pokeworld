import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Observable } from 'rxjs';
import { DEBUG_GAMES, DEBUG_PLAYERS } from './debug-page.component.const';
import { Player } from '@common/interfaces/player';

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
                this.copyToClipboard(this.lobbySocketsService.matchCode);

                // Commenter cette ligne pour tester la character selection
                this.lobbySocketsService.updatePlayer(DEBUG_PLAYERS[0]);
            }
        });
    }

    joinMatch(): void {
        this.lobbySocketsService.joinMatch(this.joinRoomCode).subscribe((joinStatus) => {
            if (joinStatus) {
                this.isAdmin = false;

                // Commenter cette ligne pour tester la character selection
                this.lobbySocketsService.updatePlayer(DEBUG_PLAYERS[1]);
            }
        });
        this.joinRoomCode = '';
    }

    copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
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
        const playerModifs = structuredClone(DEBUG_PLAYERS[index]);
        this.lobbySocketsService.updatePlayer(playerModifs);
    }
}
