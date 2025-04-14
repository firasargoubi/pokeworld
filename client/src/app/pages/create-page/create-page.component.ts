import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PopupMessage } from '@app/consts/popup-message.const';
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
    private isCreatingMatch = false;
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

    async createMatch(gameData: GameData) {
        if (!this.isCreatingMatch) {
            this.isCreatingMatch = true;
            const isMatchCreated = await this.matchService.createMatch(gameData);
            if (!isMatchCreated) {
                this.loadGames();
                this.isCreatingMatch = false;
            }
        }
    }

    private loadGames() {
        this.gameSaveService.getAllGames().subscribe({
            next: (games) => {
                this.games = games.filter((game) => game.isVisible);
            },
            error: () => {
                this.popupService.showPopup({ message: PopupMessage.ConnectionError, hasCloseButton: true, isConfirmation: false });
            },
        });
    }
}
