import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MapComponent } from '@app/components/map/map.component';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { DEFAULT_PLAY_VISUAL_DATA } from '@app/consts/play-data.const';
import { PlayerVisualData, PlayVisualData } from '@app/interfaces/play-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { TileDescriptionService } from '@app/services/tile-description/tile-description.service';
import { TimerService } from '@app/services/timer/timer.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { TurnPhase } from '@common/interfaces/match';
import { Player } from '@common/interfaces/player';

@Component({
    selector: 'app-play-page',
    templateUrl: './play-page.component.html',
    styleUrls: ['./play-page.component.scss'],
    imports: [MapComponent, CommonModule, ChatComponent],
})
export class PlayPageComponent {
    playVisualData: PlayVisualData = structuredClone(DEFAULT_PLAY_VISUAL_DATA);
    timerService: TimerService = inject(TimerService);
    tileDescriptionService: TileDescriptionService = inject(TileDescriptionService);
    private playSocketsService: PlaySocketsService = inject(PlaySocketsService);
    private matchDataService: MatchDataService = inject(MatchDataService);
    private gameDataService: GameDataService = inject(GameDataService);
    private coreSocketService: CoreSocketService = inject(CoreSocketService);
    private popupService: PopupService = inject(PopupService);
    private thumbnailService: ThumbnailService = inject(ThumbnailService);
    private mapService: MapService = inject(MapService);
    private router: Router = inject(Router);

    constructor() {
        this.coreSocketService.connectionStatus.subscribe((status) => this.verifySocketConnection(status));
        this.computeVisualData();
        this.matchDataService.matchUpdate.subscribe(this.computeVisualData.bind(this));
        this.generateThumbnail();
        this.mapService.clearOverlays();
    }

    get mapSize(): string {
        return this.gameDataService.gameData.mapData.size.toString();
    }

    get gameMode(): string {
        return this.gameDataService.gameData.mapData.gameMode;
    }

    get selfPlayer(): Player | undefined {
        return this.matchDataService.matchData.players[this.matchDataService.selfIndex];
    }

    get canUseAction(): boolean {
        let canUseAction = false;

        if (this.selfPlayer) {
            const isActivePlayer = this.matchDataService.matchData.activePlayer === this.matchDataService.selfIndex;
            const isATurnPhase = this.matchDataService.matchData.phase === TurnPhase.Turn;
            const hasAction = this.selfPlayer.currentStats.hasAction;
            canUseAction = isActivePlayer && isATurnPhase && hasAction;
        }

        return canUseAction;
    }

    get canEndTurn(): boolean {
        const isActivePlayer = this.matchDataService.matchData.activePlayer === this.matchDataService.selfIndex;
        const isATurnPhase = this.matchDataService.matchData.phase === TurnPhase.Turn;

        return isActivePlayer && isATurnPhase;
    }

    get selfIndex(): number {
        return this.matchDataService.selfIndex;
    }

    get currentPlayerCount(): number {
        return this.matchDataService.matchData.players.filter((p: Player) => p.isConnected).length;
    }

    get maxPlayerCount(): number {
        return this.matchDataService.matchData.players.length;
    }

    get activePlayer(): number {
        return this.matchDataService.matchData.activePlayer;
    }

    get players(): PlayerVisualData[] {
        return this.matchDataService.matchData.players.map((player: Player) => ({
            id: player.id,
            name: player.name,
            avatarUrl: AVATAR_DATA[player.avatar].imageCentered,
            fightsWon: player.currentStats.fightsWon,
            isAdmin: player.isAdmin,
            isBot: player.isBot,
            isConnected: player.isConnected,
        }));
    }

    get selfAvatarUrl(): string {
        let selfAvatarUrl = EMPTY_IMAGE;

        if (this.selfPlayer) {
            selfAvatarUrl = AVATAR_DATA[this.selfPlayer.avatar].imageCentered;
        }

        return selfAvatarUrl;
    }

    get selfName(): string {
        let selfName = '';

        if (this.selfPlayer) {
            selfName = this.selfPlayer.name;
        }

        return selfName;
    }

    get currentMovement(): number {
        let currentMovement = 0;

        if (this.selfPlayer) {
            currentMovement = this.selfPlayer.currentStats.movement;
        }

        return currentMovement;
    }

    get maxMovement(): number {
        let maxMovement = 0;

        if (this.selfPlayer) {
            maxMovement = this.selfPlayer.playerStats.speed;
        }

        return maxMovement;
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.repeat) {
            return;
        }
        if (event.key === 'd' || event.key === 'D') {
            this.playSocketsService.changeDebugMode();
        }
    }

    useAction() {
        if (this.mapService.hasActionOverlay()) {
            this.mapService.clearActions();
        } else if (this.canUseAction) {
            this.playSocketsService.displayActions();
        }
    }

    endTurn() {
        if (this.canEndTurn) {
            this.playSocketsService.endTurn();
        }
    }

    surrender() {
        this.popupService.showPopup('Voulez-vous vraiment abandonner ?', true, this.leaveMatch.bind(this));
    }

    showTileDescription(event: MouseEvent): void {
        this.tileDescriptionService.displayTileDescription(event);
    }
    hideTileDescription(): void {
        this.tileDescriptionService.hideTileDescription();
    }

    private computeVisualData() {
        this.playVisualData = {
            mapSize: this.mapSize,
            gameMode: this.gameMode,
            canUseAction: this.canUseAction,
            canEndTurn: this.canEndTurn,
            selfIndex: this.selfIndex,
            currentPlayerCount: this.currentPlayerCount,
            maxPlayerCount: this.maxPlayerCount,
            activePlayer: this.activePlayer,
            players: this.players,
            selfAvatarUrl: this.selfAvatarUrl,
            selfName: this.selfName,
            currentMovement: this.currentMovement,
            maxMovement: this.maxMovement,
            thumbnailUrl: this.playVisualData.thumbnailUrl,
        };
    }

    private async generateThumbnail() {
        const url = await this.thumbnailService.getThumbnail(this.gameDataService.gameData.mapData, false);
        this.playVisualData.thumbnailUrl = url;
    }

    private leaveMatch() {
        this.playSocketsService.leaveMatch();
        this.router.navigate([PageEndpoint.Menu]);
    }

    private verifySocketConnection(isConnected: boolean) {
        if (!isConnected || this.matchDataService.matchData.players.length <= 0) {
            this.router.navigate([PageEndpoint.Menu]);
        }
    }
}
