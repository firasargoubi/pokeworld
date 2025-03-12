import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { GameData } from '@common/game-data';

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
    private lobbySocketService: LobbySocketsService = inject(LobbySocketsService);
    private popupService: PopupService = inject(PopupService);

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
                this.createGame(game);
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
                this.popupService.showPopup(error.error);
            },
        });
    }

    private async createGame(game: GameData) {
        if (game.isVisible) {
            window.console.log('HERE 1');
            const hasCreatedGame = await this.lobbySocketService.createMatch(game._id);
            window.console.log('HERE 2');
            if (hasCreatedGame) {
                this.router.navigate(['/player-selection']);
                return;
            }
        }

        this.loadGames();
        this.popupService.showPopup("Ce jeu n'est plus visible");
    }

    private handleNotFoundError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.popupService.showPopup("Ce jeu n'existe plus");
            this.loadGames();
        } else {
            this.popupService.showPopup(error.error);
        }
    }
}
