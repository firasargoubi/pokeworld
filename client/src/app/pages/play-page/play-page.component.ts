import { Component, inject } from '@angular/core';
import { MapComponent } from '@app/components/map/map.component';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { PlayerVisualData } from '@app/interfaces/player-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { CommonModule } from '@angular/common';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { TimerService } from '@app/services/timer/timer.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { Router } from '@angular/router';
import { PopupService } from '@app/services/popup/popup.service';

@Component({
    selector: 'app-play-page',
    templateUrl: './play-page.component.html',
    styleUrls: ['./play-page.component.scss'],
    imports: [MapComponent, CommonModule],
})
export class PlayPageComponent {
    thumbnailUrl: string;
    timerService: TimerService;
    private matchDataService: MatchDataService;
    private gameDataService: GameDataService;
    private coreSocketService: CoreSocketService;
    private popupService: PopupService;
    private router: Router;

    constructor() {
        this.coreSocketService = inject(CoreSocketService);
        this.popupService = inject(PopupService);
        this.router = inject(Router);
        this.coreSocketService.connectionStatus.subscribe((status) => this.verifySocketConnection(status));

        this.timerService = inject(TimerService);
        this.matchDataService = inject(MatchDataService);
        this.gameDataService = inject(GameDataService);

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
        const canUseAction = this.matchDataService.matchData.players[this.matchDataService.selfIndex].currentStats.hasAction;
        return isActivePlayer && canUseAction;
    }

    get canEndTurn(): boolean {
        return this.matchDataService.matchData.activePlayer === this.matchDataService.selfIndex;
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
        this.thumbnailUrl = await inject(ThumbnailService).getThumbnail(inject(GameDataService).gameData.mapData, false);
    }

    surrender() {
        const navigate = async () => this.router.navigate(['/']);
        this.popupService.showPopup('Voulez-vous vraiment abandonner? ', true, navigate);
    }

    action() {
        // TODO logique d'action
    }

    endTurn() {
        // TODO logique de fin de tour
        // window.console.log('endTurn');
        // // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // this.matchVisualData.currentPlayerTurn = (this.matchVisualData.currentPlayerTurn + 1) % this.matchVisualData.players.length;
        // // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // this.timerService.startTimer(30);
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
