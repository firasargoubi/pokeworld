import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerCardComponent } from '@app/components/player-card/player-card.component';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-game-lobby',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    imports: [CommonModule, HeaderComponent, PlayerCardComponent],
    standalone: true,
    imports: [FormsModule, CommonModule],
})
export class LobbyPageComponent implements OnInit {
    accessCode: string = '';
    players: Player[] = [];
    private router: Router = inject(Router);

    ngOnInit(): void {
        this.players = [
            {
                name: 'SELIM',
                avatar: Avatars.Avatar3,
                life: 6,
                speed: 5,
                attack: 10,
                defense: 4,
                bonusDice: { attack: 'd6', defense: 'd4' },
                movement: 3,
                action: 2,
            },
            {
                name: 'OMAR',
                avatar: Avatars.Avatar2,
                life: 4,
                speed: 6,
                attack: 8,
                defense: 5,
                bonusDice: { attack: 'd8', defense: 'd6' },
                movement: 3,
                action: 2,
            },
        ];
    }

    startGame(): void {
        this.router.navigate(['/']);
    }

    leaveLobby(): void {
        this.router.navigate(['/']);
    }
}
