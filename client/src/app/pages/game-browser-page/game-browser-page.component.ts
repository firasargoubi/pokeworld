import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game-save/game-save.service';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameData } from '@common/game-data';
import { finalize, Observable } from 'rxjs';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
    selector: 'app-game-browser-page',
    imports: [AsyncPipe, GameCardComponent],
    templateUrl: './game-browser-page.component.html',
    styleUrl: './game-browser-page.component.scss',
})
export class GameBrowserPageComponent implements OnInit {
    showDescription: boolean = false;
    lastDescription: string = '';
    gameList$: Observable<GameData[]>;

    constructor(
        private gameService: GameService,
        private gameDataService: GameDataService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.fetchGames();
    }

    fetchGames() {
        this.gameList$ = this.gameService.getAllGames();
    }

    onJoin(gameId: string) {
        let fetchGames = false;
        const gameGetter = {
            next: (game: GameData) => {
                if (game.isVisible) {
                    this.gameDataService.setGameData(game);
                    this.router.navigate(['/player-selection']);
                } else {
                    fetchGames = true;
                    alert("Ce jeu n'est plus VISIBLE !");
                }
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    alert("Ce jeu n'existe plus !");
                    fetchGames = true;
                }
            },
        };

        this.gameService
            .getGame(gameId)
            .pipe(
                finalize(() => {
                    if (fetchGames) {
                        this.fetchGames();
                    }
                }),
            )
            .subscribe(gameGetter);
    }

    thumbnailDescription(isMouseOver: boolean, description: string) {
        this.showDescription = isMouseOver;
        this.lastDescription = description;
    }

    getBackgroundClass(index: number): string {
        const classes = ['background-class-1', 'background-class-2', 'background-class-3'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }
}
