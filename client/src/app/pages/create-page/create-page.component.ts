import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PopupMessage } from '@app/consts/popup-message.const';
import { GAME_CARD_ROW_LENGTHS, TABLET_BREAKPOINT } from '@app/consts/ui.const';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    imports: [GameCardComponent, HeaderComponent],
})
export class CreatePageComponent implements OnInit {
    games: GameData[] = [];
    private readonly audioService: AudioService = inject(AudioService);
    private isCreatingMatch = false;
    private router: Router = inject(Router);
    private gameSaveService: GameSaveService = inject(GameSaveService);
    private matchService: MatchService = inject(MatchService);
    private popupService: PopupService = inject(PopupService);

    navigateToMenu() {
        this.audioService.playEffect(SoundEffect.Click);
        this.router.navigate([PageEndpoint.Menu]);
    }

    ngOnInit() {
        this.loadGames();
        this.audioService.playBackgroundMusic(BackgroundMusic.Home);
    }

    isLastInRow(index: number): boolean {
        const viewportWidth = window.innerWidth;
        const rowLength = viewportWidth < TABLET_BREAKPOINT ? GAME_CARD_ROW_LENGTHS.tablet : GAME_CARD_ROW_LENGTHS.desktop;
        return (index + 1) % rowLength === 0;
    }

    async createMatch(gameData: GameData) {
        if (!this.isCreatingMatch) {
            this.isCreatingMatch = true;
            const isMatchCreated = await this.matchService.createMatch(gameData);
            if (!isMatchCreated) {
                this.loadGames();
                this.isCreatingMatch = false;
            }
        }
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: () => {
                this.popupService.showPopup({ message: PopupMessage.ConnectionError, hasCloseButton: true, isConfirmation: false });
            },
        });
    }
}
