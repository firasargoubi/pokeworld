import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MapComponent } from '@app/components/map/map.component';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { PlayerVisualData } from '@app/interfaces/player-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { TimerService } from '@app/services/timer/timer.service';
import { TurnPhase } from '@common/match';

@Component({
    selector: 'app-play-page',
    templateUrl: './play-page.component.html',
    styleUrls: ['./play-page.component.scss'],
    imports: [MapComponent, CommonModule],
})
export class PlayPageComponent {
    thumbnailUrl: string;
    timerService: TimerService;
    private playSocketsService: PlaySocketsService;
    private matchDataService: MatchDataService;
    private gameDataService: GameDataService;
    private coreSocketService: CoreSocketService;
    private popupService: PopupService;
    private thumbnailService: ThumbnailService;
    private router: Router;

    constructor() {
        this.coreSocketService = inject(CoreSocketService);
        this.popupService = inject(PopupService);
        this.router = inject(Router);
        this.coreSocketService.connectionStatus.subscribe((status) => this.verifySocketConnection(status));

        this.playSocketsService = inject(PlaySocketsService);
        this.timerService = inject(TimerService);
        this.matchDataService = inject(MatchDataService);
        this.gameDataService = inject(GameDataService);
        this.thumbnailService = inject(ThumbnailService);

        this.thumbnailUrl = EMPTY_IMAGE;
        this.generateThumbnail();
    }

    get mapSize(): number {
        return this.gameDataService.gameData.mapData.size;
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

    async generateThumbnail() {
        this.thumbnailUrl = await this.thumbnailService.getThumbnail(this.gameDataService.gameData.mapData, false);
    }

    surrender() {
        const navigate = async () => this.router.navigate(['/']);
        this.popupService.showPopup('Voulez-vous vraiment abandonner? ', true, navigate);
    }

    action() {
        // TODO logique d'action
    }

    endTurn() {
        if (this.canEndTurn) {
            this.playSocketsService.endTurn();
        }
    }

    private verifySocketConnection(isConnected: boolean) {
        if (!isConnected) {
            if (this.timerService) {
                this.popupService.showPopup('Erreur de connection avec le serveur');
                this.popupService.keepMessages();
            }
            this.router.navigate(['/']);
        }
    }
}
