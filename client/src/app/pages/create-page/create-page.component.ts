import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PopupMessage } from '@app/consts/popup-message.const';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { GameState } from '@common/interfaces/game-state.enum';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    imports: [GameCardComponent, HeaderComponent, ChatComponent, TranslateModule],
})
export class CreatePageComponent implements OnInit {
    games: GameData[] = [];
    private readonly audioService: AudioService = inject(AudioService);
    private isCreatingMatch = false;
    private router: Router = inject(Router);
    private gameSaveService: GameSaveService = inject(GameSaveService);
    private matchService: MatchService = inject(MatchService);
    private popupService: PopupService = inject(PopupService);
    private readonly gameDataService: GameDataService = inject(GameDataService);

    navigateToMenu() {
        this.audioService.playEffect(SoundEffect.Click);
        this.router.navigate([PageEndpoint.Menu]);
    }

    ngOnInit() {
        this.loadGames();
        this.audioService.playBackgroundMusic(BackgroundMusic.Home);
    }

    async createMatch(gameData: GameData) {
        this.gameSaveService.getGame(gameData._id).subscribe({
            next: async (updatedGame: GameData) => {
                gameData = updatedGame;
                if (!this.isGameAccessible(gameData)) {
                    this.handleUnauthorizedAccess();
                    return;
                }
                if (!this.isCreatingMatch) {
                    this.isCreatingMatch = true;
                    const isMatchCreated = await this.matchService.createMatch(gameData);
                    if (!isMatchCreated) {
                        this.loadGames();
                        this.isCreatingMatch = false;
                    }
                }
            },
        });
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => this.isGameAccessible(game));
            },
            error: () => {
                this.popupService.showPopup({ message: PopupMessage.ConnectionError, hasCloseButton: true, isConfirmation: false });
            },
        });
    }

    private handleUnauthorizedAccess() {
        this.popupService.showPopup({ message: PopupMessage.UnauthorizedAccessToGame, hasCloseButton: true, isConfirmation: false });
        this.loadGames();
    }

    private isGameAccessible(game: GameData) {
        const isStateAcessible = [GameState.PUBLIC, GameState.PRIVATE_SHARED].includes(game.gameState);
        return this.gameDataService.isOwner(game.owner) || isStateAcessible;
    }
}
