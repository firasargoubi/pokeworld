import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { MainHeaderComponent } from '@app/components/main-header/main-header.component';
import { GameService } from '@app/services/game.service';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-creation-page',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
    imports: [GameCardComponent, MainHeaderComponent],
})
export class CreationPageComponent implements OnInit {
    games: GameData[] = [];

    constructor(
        private gameService: GameService,
        private snackBar: MatSnackBar,
    ) {}

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
