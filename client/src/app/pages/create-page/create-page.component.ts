import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';

interface PopupMessage {
    message: string;
    isConfirmation: boolean;
    action?: () => void;
}

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    imports: [GameCardComponent, HeaderComponent, WarningConfirmationPopupComponent],
})
export class CreatePageComponent implements OnInit {
    games: GameData[] = [];
    messages: PopupMessage[] = [];
    private router: Router = inject(Router);
    private gameSaveService: GameSaveService = inject(GameSaveService);
    private gameDataService: GameDataService = inject(GameDataService);

    navigateToMenu() {
        this.router.navigate(['/']);
    }

    ngOnInit() {
        this.loadGames();
    }

    getCardColor(index: number): string {
        const classes = ['blue-card', 'green-card', 'pink-card'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    onJoin(gameId: string) {
        this.gameSaveService.getGame(gameId).subscribe({
            next: (game: GameData) => {
                this.handleGameVisibility(game);
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    removeMessage(index: number, confirmed: boolean) {
        const message = this.messages[index];

        if (message.isConfirmation && confirmed && message.action) {
            message.action();
        }

        this.messages.splice(index, 1);
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: (error: HttpErrorResponse) => {
                this.messages.push({ message: error.error, isConfirmation: false });
            },
        });
    }

    private handleGameVisibility(game: GameData) {
        if (game.isVisible) {
            this.gameDataService.setGameData(game);
            this.router.navigate(['/player-selection']);
        } else {
            this.loadGames();
            this.messages.push({ message: "Ce jeu n'est plus visible", isConfirmation: false });
        }
    }

    private handleNotFoundError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.messages.push({ message: "Ce jeu n'existe plus", isConfirmation: false });
            this.loadGames();
        } else {
            this.messages.push({ message: error.error, isConfirmation: false });
        }
    }
}
