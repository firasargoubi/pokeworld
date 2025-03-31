import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MapComponent } from '@app/components/map/map.component';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { DEFAULT_PLAY_VISUAL_DATA } from '@app/consts/play-data.const';
import { PlayVisualData } from '@app/interfaces/play-visual-data';
import { MapService } from '@app/services/map/map.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { PopupService } from '@app/services/popup/popup.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { TileDescriptionService } from '@app/services/tile-description/tile-description.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MatchState } from '@common/interfaces/match-data';
import { PlayerType } from '@common/interfaces/player-data';

@Component({
    selector: 'app-play-page',
    templateUrl: './play-page.component.html',
    styleUrls: ['./play-page.component.scss'],
    imports: [MapComponent, CommonModule, ChatComponent],
})
export class PlayPageComponent {
    visualData: PlayVisualData = structuredClone(DEFAULT_PLAY_VISUAL_DATA);
    tileDescriptionService: TileDescriptionService = inject(TileDescriptionService);
    matchService: MatchService = inject(MatchService);
    playService: PlayService = inject(PlayService);
    private popupService: PopupService = inject(PopupService);
    private thumbnailService: ThumbnailService = inject(ThumbnailService);
    private mapService: MapService = inject(MapService);
    private router: Router = inject(Router);

    constructor() {
        if (!this.matchService.isInMatch()) {
            this.router.navigate([PageEndpoint.Menu]);
        }
        this.onMatchUpdate();
        this.matchService.matchUpdate.subscribe(this.onMatchUpdate.bind(this));
        this.generateThumbnail();
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (!event.repeat) {
            if (event.key === 'd' || event.key === 'D') {
                this.playService.changeDebugMode();
            }
        }
    }

    actionButton() {
        if (this.mapService.hasActionOverlay()) {
            this.mapService.clearActions();
        } else if (this.visualData.canUseAction) {
            this.playService.displayActions();
        }
    }

    endTurnButton() {
        if (this.visualData.canEndTurn) {
            this.playService.endTurn();
        }
    }

    surrenderButton() {
        this.popupService.showPopup('Voulez-vous vraiment abandonner ?', true, this.matchService.leaveMatch.bind(this.matchService));
    }

    showTileDescription(event: MouseEvent): void {
        this.tileDescriptionService.displayTileDescription(event);
    }

    hideTileDescription(): void {
        this.tileDescriptionService.hideTileDescription();
    }

    private onMatchUpdate() {
        this.updateVisual();
        this.checkForRedirect();
    }

    private checkForRedirect() {
        const isSelfInCombat = this.matchService.data.combatData.playersCombatData.some((p) => p.playerIndex === this.matchService.selfIndex);
        const isMatchInCombatState = this.matchService.isState([MatchState.CombatWait, MatchState.CombatAnimation, MatchState.CombatEnd]);
        if (isSelfInCombat && isMatchInCombatState) {
            this.router.navigate([PageEndpoint.Combat]);
        } else if (this.matchService.isState([MatchState.Statistics])) {
            // TODO rediriger vers la page de statistique
        }
    }

    private updateVisual() {
        this.visualData = {
            canUseAction: this.matchService.canUseAction(),
            canEndTurn: this.matchService.canEndTurn(),
            currentPlayerCount: this.matchService.data.players.filter((p) => p.isConnected).length,
            players: this.matchService.data.players.map((p, i) => ({
                id: p.id,
                name: p.name,
                avatarUrl: AVATAR_DATA[p.avatar].imageCentered,
                combatsWon: p.combatsWon,
                isHost: i === this.matchService.data.lobbyData.hostPlayerIndex,
                isBot: p.type !== PlayerType.Player,
                isConnected: p.isConnected,
            })),
            selfAvatarUrl: AVATAR_DATA[this.matchService.selfPlayer.avatar].imageCentered,
            movementLeft: this.matchService.getMovementLeft(),
            thumbnailUrl: this.visualData.thumbnailUrl,
        };
    }

    private async generateThumbnail() {
        const url = await this.thumbnailService.getThumbnail(this.matchService.data.gameData.mapData, false);
        this.visualData.thumbnailUrl = url;
    }
}
