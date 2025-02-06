import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { MainHeaderComponent } from '@app/components/main-header/main-header.component';
import { GameService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    imports: [GameCardComponent, MainHeaderComponent],
})
export class CreatePageComponent implements OnInit {
    games: GameData[] = [];

    constructor(
        private gameService: GameService,
        private snackBar: MatSnackBar,
        private gameDataService: GameDataService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.loadGames();
    }

    loadGames() {
        this.gameService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: (error: HttpErrorResponse) => {
                this.handleError(error);
            },
        });
    }

    getCardColor(index: number): string {
        const classes = ['blue-card', 'green-card', 'pink-card'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    onJoin(gameId: string) {
        const gameGetter = {
            next: (game: GameData) => {
                this.handleGameVisibility(game);
            },
            error: (error: HttpErrorResponse) => {
                this.handleNotFoundError(error);
            },
        };

        this.gameService.getGame(gameId).subscribe(gameGetter);
    }

    handleNotFoundError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            alert("Ce jeu n'existe plus !");
            this.loadGames();
        } else {
            this.handleError(error);
        }
    }

    handleGameVisibility(game: GameData) {
        if (game.isVisible) {
            this.gameDataService.setGameData(game);
            this.router.navigate(['/player-selection']);
        } else {
            this.loadGames();
            alert("Ce jeu n'est plus visible !");
        }
    }

    private handleError(error: HttpErrorResponse) {
        this.snackBar.open(`${error.message}`, 'Close', { duration: 5000 }); // Doesnt work
    }
}
