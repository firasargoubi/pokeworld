import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PopupMessage } from '@app/interfaces/popup-message';
import { GameSaveService } from '@app/services/game-save/game-save.service';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
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
    private matchService: MatchService = inject(MatchService);
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

    createMatch(gameData: GameData) {
        this.matchService.createMatch(gameData);
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: () => {
                const popupMessage: PopupMessage = {
                    message: 'Erreur de connection avec le serveur',
                    hasCloseButton: true,
                    isConfirmation: false,
                };
                this.popupService.showPopup(popupMessage);
            },
        });
    }
}
