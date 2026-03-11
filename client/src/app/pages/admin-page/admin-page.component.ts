import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { CreateGamePopupComponent } from '@app/components/create-game-popup/create-game-popup.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { PopupMessage } from '@app/consts/popup-message.const';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { GameState } from '@common/interfaces/game-state.enum';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    imports: [GameCardComponent, PokeballButtonComponent, CreateGamePopupComponent, CommonModule, HeaderComponent, ChatComponent, TranslateModule],
})
export class AdminPageComponent implements OnInit {
    games: GameData[] = [];
    isCreationMode: boolean = false;
    private readonly audioService: AudioService = inject(AudioService);
    private readonly router: Router = inject(Router);
    private readonly gameSaveService: GameSaveService = inject(GameSaveService);
    private readonly i18nService: I18nService = inject(I18nService);
    private readonly popupService: PopupService = inject(PopupService);
    private readonly gameDataService: GameDataService = inject(GameDataService);

    @HostListener('document:keydown.escape')
    onEscapeKeydown() {
        if (this.isCreationMode) {
            this.isCreationMode = false;
        }
    }

    navigateToMenu() {
        this.router.navigate([PageEndpoint.Menu]);
        this.audioService.playEffect(SoundEffect.Click);
    }

    ngOnInit() {
        this.loadGames();
        this.audioService.playBackgroundMusic(BackgroundMusic.Home);
    }

    editGame(id: string) {
        this.gameSaveService.getGame(id).subscribe({
            next: (game: GameData) => {
                if (!this.isGameAccessible(game)) {
                    this.handleUnauthorizedAccess();
                    return;
                }
                this.router.navigate([PageEndpoint.Edit]);
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    deleteGame(id: string, name: string) {
        this.gameSaveService.getGame(id).subscribe({
            next: (game: GameData) => {
                if (!this.isGameAccessible(game)) {
                    this.handleUnauthorizedAccess();
                    return;
                } else {
                    this.popupService.showPopup({
                        message: `${this.i18nService.translate(PopupMessage.DeleteGame)}\n\t - ${name}`,
                        hasCloseButton: true,
                        isConfirmation: true,
                        action: () => this.confirmDeleteGame(id),
                    });
                }
            },
            error: (error: HttpErrorResponse) => this.handleNotFoundError(error),
        });
    }

    onCreateGame() {
        this.isCreationMode = !this.isCreationMode;
        this.audioService.playEffect(SoundEffect.Click);
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => this.isGameAccessible(game));
            },
            error: () => {
                this.popupService.showPopup({ message: PopupMessage.ErrorLoadingGames, hasCloseButton: true, isConfirmation: false });
            },
        });
    }

    private confirmDeleteGame(id: string) {
        this.gameSaveService.deleteGame(id).subscribe({
            next: () => {
                this.games = this.games.filter((game) => game._id !== id);
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    private handleNotFoundError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.popupService.showPopup({ message: PopupMessage.GameDoesNotExist, hasCloseButton: true, isConfirmation: false });
            this.loadGames();
        } else {
            this.popupService.showPopup({ message: PopupMessage.ErrorFetchingGame, hasCloseButton: true, isConfirmation: false });
        }
    }

    private handleUnauthorizedAccess() {
        this.popupService.showPopup({ message: PopupMessage.UnauthorizedAccessToGame, hasCloseButton: true, isConfirmation: false });
        this.loadGames();
    }

    private isGameAccessible(game: GameData) {
        const isGamePublic = game.gameState === GameState.PUBLIC;
        const isOwner = this.gameDataService.isOwner(game.owner);
        return isGamePublic || isOwner;
    }
}
