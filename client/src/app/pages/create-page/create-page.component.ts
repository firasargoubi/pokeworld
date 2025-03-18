import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';

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
        this.router.navigate([PageEndpoint.Menu]);
    }

    ngOnInit() {
        this.loadGames();
    }

    getCardColor(index: number): string {
        const classes = ['blue-card', 'green-card', 'pink-card'];
        const classIndex = index % classes.length;
        return classes[classIndex];
    }

    async createMatch(gameData: GameData) {
        this.lobbySocketService.createMatch(gameData).then((hasCreatedGame) => {
            if (hasCreatedGame) {
                this.router.navigate([PageEndpoint.PlayerSelection]);
            } else {
                this.loadGames();
                this.popupService.showPopup("Ce jeu n'est plus disponible");
            }
        });
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: () => {
                this.popupService.showPopup('Erreur de connection avec le serveur');
            },
        });
    }
}
