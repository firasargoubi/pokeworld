import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { GameData } from '@common/game-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    imports: [GameCardComponent, HeaderComponent],
})
export class CreatePageComponent implements OnInit {
    games: GameData[] = [];
    private router: Router = inject(Router);
    private gameSaveService: GameSaveService = inject(GameSaveService);
    private snackBar: MatSnackBar = inject(MatSnackBar);
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

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: (error: HttpErrorResponse) => {
                this.handleError(error);
            },
        });
    }

    private handleGameVisibility(game: GameData) {
        if (game.isVisible) {
            this.gameDataService.setGameData(game);
            this.router.navigate(['/player-selection']);
        } else {
            this.loadGames();
            alert("Ce jeu n'est plus visible !");
        }
    }

    private handleNotFoundError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            alert("Ce jeu n'existe plus !");
            this.loadGames();
        } else {
            this.handleError(error);
        }
    }

    private handleError(error: HttpErrorResponse) {
        this.snackBar.open(`${error.message}`, 'Close', { duration: 5000 }); // Doesnt work
    }
}
