import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    imports: [GameCardComponent, HeaderComponent],
})
export class CreatePageComponent implements OnInit {
    games: GameData[] = [];

    constructor(
        private router: Router,
        private gameService: GameService,
        private snackBar: MatSnackBar,
    ) {}

    navigateToMenu() {
        this.router.navigate(['/']);
    }

    ngOnInit() {
        this.loadGames();
    }

    loadGames() {
        this.gameService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: (err: HttpErrorResponse) => {
                this.handleError('Failed to load games. Please try again later.', err);
            },
        });
    }

    getCardColor(index: number): string {
        const classes = ['blue-card', 'green-card', 'pink-card'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    private handleError(message: string, error: HttpErrorResponse) {
        this.snackBar.open(`${message}: ${error.message}`, 'Close', { duration: 5000 });
    }
}
