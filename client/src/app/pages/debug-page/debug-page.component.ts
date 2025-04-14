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
    selector: 'app-debug-page',
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

    createMatch(index: number) {
        const gameData = DEBUG_GAMES[index];
        this.socketService.emit(MatchEvent.CreateMatch, gameData, this.onJoinMatch.bind(this));
    }

    private joinMatch() {
        this.socketService.emit(MatchEvent.JoinMatch, this.matchCodeInput, this.onJoinMatch.bind(this));
    }

    private onJoinMatch(matchData: MatchData | null) {
        if (matchData !== null) {
            this.copyToClipboard(matchData.code);
            const selfIndex = matchData.players.length - 1;
            const player = DEBUG_PLAYERS[selfIndex];
            player.id = this.socketService.selfId;
            this.socketService.emit(LobbyEvent.JoinLobby, player);
            this.matchService.selfIndex = selfIndex;
            this.router.navigate([PageEndpoint.Lobby]);
        }
    }

    private copyToClipboard(text: string) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) {
            navigator.clipboard.writeText(text).then().catch(this.askCopyPermission.bind(this, text));
        }
    }

    private askCopyPermission(text: string) {
        navigator.permissions
            .query({ name: 'clipboard-write' as PermissionName })
            .then()
            .catch();
        navigator.clipboard.writeText(text).then().catch();
    }
}
