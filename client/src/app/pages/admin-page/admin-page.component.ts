import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { CreateGamePopupComponent } from '@app/components/create-game-popup/create-game-popup.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { MainHeaderComponent } from '@app/components/main-header/main-header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { GameService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    imports: [GameCardComponent, PokeballButtonComponent, RouterLink, MainHeaderComponent, CreateGamePopupComponent],
})
export class AdminPageComponent implements OnInit {
    games: GameData[] = [];
    showDescription: boolean = false;
    lastDescription: string = '';
    isCreationMode: boolean = false;

    constructor(
        private router: Router,
        private gameService: GameService,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.loadGames();
    }

    loadGames() {
        this.gameService.getAllGames().subscribe({
            next: (games) => {
                this.games = games;
            },
            error: (error: HttpErrorResponse) => {
                this.handleError(error);
            },
        });
    }

    editGame(id: string) {
        this.gameService.getGame(id).subscribe({
            next: () => {
                sessionStorage.setItem('editGameId', id); // change to game-Data.service
                this.router.navigate(['/edit']);
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    toggleVisibility(event: { id: string; isVisible: boolean }) {
        this.gameService.toggleVisibility(event.id).subscribe({
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    deleteGame(id: string) {
        this.gameService.deleteGame(id).subscribe({
            next: () => {
                this.games = this.games.filter((game) => game._id !== id);
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        });
    }

    onCreateGame(): void {
        this.isCreationMode = !this.isCreationMode;
    }

    getCardColor(index: number): string {
        const classes = ['blue-card', 'green-card', 'pink-card'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    private handleNotFoundError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            alert("Ce jeu n'existe plus !"); // CHECK and Change to popup component
            this.loadGames();
        } else {
            this.handleError(error);
        }
    }

    private handleError(error: HttpErrorResponse) {
        this.snackBar.open(`${error.message}`, 'Close', { duration: 5000 }); // Doesnt work
    }
}
