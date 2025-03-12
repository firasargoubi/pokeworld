import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-lobby',
    templateUrl: './debug-page.component.html',
    styleUrls: ['./debug-page.component.scss'],
    standalone: true,
    imports: [FormsModule, CommonModule],
})
export class DebugPageComponent {
    joinRoomCode: string = '';
    updatedPlayerName: string = '';
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

    createRoom(): void {
        this.lobbySocketsService.createMatch('asd');
    }

    joinRoom(): void {
        this.lobbySocketsService.joinMatch(this.joinRoomCode);
        this.joinRoomCode = '';
    }

    leaveRoom(): void {
        this.lobbySocketsService.leaveMatch();
    }

    updatePlayer(playerUpdates: Partial<Player>): void {
        this.lobbySocketsService.updatePlayer(playerUpdates);
        this.updatedPlayerName = '';
    }

    lockRoom() {
        this.lobbySocketsService.toggleLockRoom(true);
    }

    unlockRoom() {
        this.lobbySocketsService.toggleLockRoom(false);
    }
}
