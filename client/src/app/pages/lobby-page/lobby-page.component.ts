import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerCardComponent } from '@app/components/player-card/player-card.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { DEFAULT_LOBBY_VISUAL_DATA } from '@app/consts/player-data.const';
import { LobbyVisualData } from '@app/interfaces/lobby-visual-data';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { MAX_PLAYERS } from '@common/consts/player-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    imports: [CommonModule, HeaderComponent, PlayerCardComponent, PokeballButtonComponent, ChatComponent],
    standalone: true,
})
export class LobbyPageComponent {
    visualData: LobbyVisualData = structuredClone(DEFAULT_LOBBY_VISUAL_DATA);
    matchService: MatchService = inject(MatchService);
    private lobbyService: LobbyService = inject(LobbyService);
    private popupService: PopupService = inject(PopupService);
    private router: Router = inject(Router);

    constructor() {
        if (!this.matchService.isInMatch()) {
            this.router.navigate([PageEndpoint.Menu]);
        }
        this.updateVisual();
        this.matchService.matchUpdate.pipe(takeUntilDestroyed()).subscribe(this.updateVisual.bind(this));
    }

    startMatchButton(): void {
        this.lobbyService.startMatch();
    }

    leaveLobbyButton(): void {
        this.popupService.showPopup('Voulez-vous vraiment quitter ?', true, this.matchService.leaveMatch.bind(this.matchService));
    }

    toggleLockRoom(): void {
        this.lobbyService.changeLockStatus(!this.matchService.data.lobbyData.isLocked);
    }

    kickPlayer(playerId: string): void {
        this.lobbyService.kickPlayer(playerId);
    }

    copyMatchCode() {
        this.copyToClipboard(this.matchService.data.code);
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

    private updateVisual() {
        this.visualData.isSelfHost = this.matchService.isHost();
        this.visualData.players = this.matchService.data.players
            .map((p, i) => ({
                isConnected: p.isConnected,
                name: p.name,
                isHost: i === this.matchService.data.lobbyData.hostPlayerIndex,
                isSelf: i === this.matchService.selfIndex,
                avatarImage: AVATAR_DATA[p.avatar].imageCentered,
                health: p.health,
                id: p.id,
            }))
            .filter((p) => p.isConnected);
        while (this.visualData.players.length < MAX_PLAYERS[this.matchService.data.gameData.mapData.size]) {
            this.visualData.players.push({ ...this.visualData.players[0], isHost: false, isSelf: false, isConnected: false });
        }
    }
}
