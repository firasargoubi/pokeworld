import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MatchData } from '@common/interfaces/match-data';
import { LobbyEvent, MatchEvent } from '@common/interfaces/socket-event.enum';
import { DEBUG_GAMES, DEBUG_PLAYERS } from './debug-page.component.const';

@Component({
    selector: 'app-game-lobby',
    templateUrl: './debug-page.component.html',
    styleUrls: ['./debug-page.component.scss'],
    standalone: true,
    imports: [FormsModule, CommonModule],
})
export class DebugPageComponent {
    matchCodeInput: string = '';
    private matchService: MatchService = inject(MatchService);
    private socketService: SocketService = inject(SocketService);
    private router: Router = inject(Router);

    constructor() {
        this.matchService['resetMatchData']();
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (!event.repeat) {
            if (event.key === 'Enter' || event.key === 'Return') {
                if (this.matchCodeInput) {
                    this.joinMatch();
                }
            }
        }
    }

    createMatch(index: number): void {
        const gameData = DEBUG_GAMES[index];
        this.socketService.emit(MatchEvent.CreateMatch, gameData, (matchData: MatchData | null) => {
            if (matchData !== null) {
                navigator.clipboard.writeText(matchData.code);
                const selfIndex = 0;
                const player = DEBUG_PLAYERS[selfIndex];
                player.id = this.socketService.selfId;
                this.socketService.emit(LobbyEvent.JoinLobby, player);
                this.matchService.selfIndex = selfIndex;
                this.router.navigate([PageEndpoint.Lobby]);
            }
        });
    }

    private joinMatch(): void {
        this.socketService.emit(MatchEvent.JoinMatch, this.matchCodeInput, (matchData: MatchData | null) => {
            if (matchData !== null) {
                const selfIndex = matchData.players.length - 1;
                const player = DEBUG_PLAYERS[selfIndex];
                player.id = this.socketService.selfId;
                this.socketService.emit(LobbyEvent.JoinLobby, player);
                this.matchService.selfIndex = selfIndex;
                this.router.navigate([PageEndpoint.Lobby]);
            }
        });
    }
}
