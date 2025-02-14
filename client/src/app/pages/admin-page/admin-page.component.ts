import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateGamePopupComponent } from '@app/components/create-game-popup/create-game-popup.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { PopupMessage } from '@app/interfaces/popup-message';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    imports: [GameCardComponent, PokeballButtonComponent, CreateGamePopupComponent, CommonModule, HeaderComponent, WarningConfirmationPopupComponent],
})
export class AdminPageComponent implements OnInit {
    games: GameData[] = [];
    messages: PopupMessage[] = [];
    showDescription: boolean = false;
    lastDescription: string = '';
    isCreationMode: boolean = false;
    private router: Router = inject(Router);
    private gameSaveService: GameSaveService = inject(GameSaveService);

    navigateToMenu() {
        this.router.navigate(['/']);
    }

    ngOnInit() {
        this.loadGames();
    }

    loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games;
            },
            error: () => {
                this.addMessage('Échec lors du chargement des jeux', false);
            },
        });
    }

    editGame(id: string) {
        this.gameSaveService.getGame(id).subscribe({
            next: () => {
                sessionStorage.setItem('editGameId', id);
                this.router.navigate(['/edit']);
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
        this.addMessage('Êtes-vous sûr de vouloir supprimer le jeu : ' + name, true, () => this.confirmDeleteGame(id));
    }

    onCreateGame(): void {
        this.isCreationMode = !this.isCreationMode;
    }

    getCardColor(index: number): string {
        const classes = ['blue-card', 'green-card', 'pink-card'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    removeMessage(index: number, confirmed: boolean) {
        const message = this.messages[index];

        if (message.isConfirmation && confirmed && message.action) {
            message.action();
        }

        this.messages.splice(index, 1);
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

    private addMessage(message: string, isConfirmation: boolean, action?: () => void) {
        this.messages.push({ message, isConfirmation, action });
    }

    private handleNotFoundError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.addMessage("Ce jeu n'existe plus !", false);
            this.loadGames();
        } else {
            this.addMessage(error.message, false);
        }
    }
}
