import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { GameService } from '@app/services/game.service';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    imports: [GameCardComponent, PokeballButtonComponent],
})
export class AdminPageComponent implements OnInit {
    games: GameData[] = [];
    showDescription: boolean = false;
    lastDescription: string = '';

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
            error: (err: HttpErrorResponse) => {
                this.handleError('Failed to load games. Please try again later.', err);
            },
        });
    }

    editGame(id: string) {
        sessionStorage.setItem('editGameId', id);
        this.router.navigate(['/edit']);
    }

    toggleVisibility(event: { id: string; isVisible: boolean }) {
        this.gameService.toggleVisibility(event.id).subscribe({
            error: (err) => {
                this.handleError('Failed to toggle game visibility. Please try again later.', err);
            },
        });
    }

    deleteGame(id: string) {
        this.gameService.deleteGame(id).subscribe({
            next: () => {
                this.games = this.games.filter((game) => game._id !== id);
            },
            error: (err) => {
                this.handleError('Failed to delete game. Please try again later.', err);
            },
        });
    }

    getBackgroundClass(index: number): string {
        const classes = ['background-class-1', 'background-class-2', 'background-class-3'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    private handleError(message: string, error: HttpErrorResponse) {
        this.snackBar.open(`${message}: ${error.message}`, 'Close', { duration: 5000 });
    }
}
