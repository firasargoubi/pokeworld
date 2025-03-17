import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MapComponent } from '@app/components/map/map.component';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { PlayerVisualData, PlayVisualData } from '@app/interfaces/play-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { TimerService } from '@app/services/timer/timer.service';
import { TurnPhase } from '@common/match';
import { DEFAULT_PLAY_VISUAL_DATA } from './play-page.component.const';

@Component({
    selector: 'app-play-page',
    templateUrl: './play-page.component.html',
    styleUrls: ['./play-page.component.scss'],
    imports: [MapComponent, CommonModule],
})
export class PlayPageComponent {
    playVisualData: PlayVisualData = structuredClone(DEFAULT_PLAY_VISUAL_DATA);
    timerService: TimerService = inject(TimerService);
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
    }

    get mapSize(): string {
        return this.gameDataService.gameData.mapData.size.toString();
    }

    get gameMode(): string {
        return this.gameDataService.gameData.mapData.gameMode;
    }

    get canUseAction(): boolean {
        const isActivePlayer = this.matchDataService.matchData.activePlayer === this.matchDataService.selfIndex;
        const isATurnPhase = this.matchDataService.matchData.phase === TurnPhase.Turn;
        const canUseAction = this.matchDataService.matchData.players[this.matchDataService.selfIndex].currentStats.hasAction;

        return isActivePlayer && isATurnPhase && canUseAction;
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
        return this.matchDataService.matchData.players.filter((p) => p.isConnected).length;
    }

    get maxPlayerCount(): number {
        return this.matchDataService.matchData.players.length;
    }

    get activePlayer(): number {
        return this.matchDataService.matchData.activePlayer;
    }

    get players(): PlayerVisualData[] {
        return this.matchDataService.matchData.players.map((player) => ({
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
        return this.players[this.matchDataService.selfIndex].avatarUrl;
    }

    get selfName(): string {
        return this.players[this.matchDataService.selfIndex].name;
    }

    get currentMovement(): number {
        return this.matchDataService.matchData.players[this.matchDataService.selfIndex].currentStats.movement;
    }

    get maxMovement(): number {
        return this.matchDataService.matchData.players[this.matchDataService.selfIndex].playerStats.speed;
    }
    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
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
        this.router.navigate(['/']);
    }

    private verifySocketConnection(isConnected: boolean) {
        if (!isConnected || this.matchDataService.matchData.players.length <= 0) {
            if (this.timerService) {
                this.popupService.clearMessages();
                this.popupService.showPopup('Erreur de connection avec le serveur');
                this.popupService.keepMessages();
            }
            this.router.navigate(['/']);
        }
    }
}
