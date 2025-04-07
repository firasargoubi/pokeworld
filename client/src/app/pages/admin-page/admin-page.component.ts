import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateGamePopupComponent } from '@app/components/create-game-popup/create-game-popup.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { ConfirmationMessage } from '@app/interfaces/confirmation-message.enum';
import { PopupMessage } from '@app/interfaces/popup-message';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    imports: [GameCardComponent, PokeballButtonComponent, CreateGamePopupComponent, CommonModule, HeaderComponent],
})
export class AdminPageComponent implements OnInit {
    games: GameData[] = [];
    isCreationMode: boolean = false;
    private router: Router = inject(Router);
    private gameSaveService: GameSaveService = inject(GameSaveService);
    private popupService: PopupService = inject(PopupService);

    navigateToMenu() {
        this.router.navigate([PageEndpoint.Menu]);
    }

    ngOnInit() {
        this.loadGames();
    }

    editGame(id: string) {
        this.gameSaveService.getGame(id).subscribe({
            next: () => {
                this.router.navigate([PageEndpoint.Edit]);
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    toggleVisibility(event: { id: string; isVisible: boolean }) {
        this.gameSaveService.toggleVisibility(event.id).subscribe({
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    deleteGame(id: string, name: string) {
        const popupMessage: PopupMessage = {
            message: ConfirmationMessage.DeleteGame + name,
            hasCloseButton: true,
            isConfirmation: true,
            action: () => this.confirmDeleteGame(id),
        };
        this.popupService.showPopup(popupMessage);
    }

    onCreateGame(): void {
        this.isCreationMode = !this.isCreationMode;
    }

    getCardColor(index: number): string {
        const classes = ['blue-card', 'green-card', 'pink-card'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games;
            },
            error: () => {
                const popupMessage: PopupMessage = {
                    message: ConfirmationMessage.ErrorLoadingGames,
                    hasCloseButton: true,
                    isConfirmation: false,
                };
                this.popupService.showPopup(popupMessage);
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
        const popupMessage: PopupMessage = {
            message: '',
            hasCloseButton: true,
            isConfirmation: false,
        };
        if (error.status === HttpStatusCode.NotFound) {
            popupMessage.message = ConfirmationMessage.GameDoesntExist;
            this.popupService.showPopup(popupMessage);
            this.loadGames();
        } else {
            popupMessage.message = ConfirmationMessage.ErrorFetchingGame;
            this.popupService.showPopup(popupMessage);
        }
    }
}
