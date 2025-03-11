import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerCardComponent } from '@app/components/player-card/player-card.component';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player } from '@common/player';

@Component({
    selector: 'app-game-lobby',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    imports: [CommonModule, HeaderComponent, PlayerCardComponent],
    standalone: true,
})
export class LobbyPageComponent implements OnInit {
    accessCode: string = '';
    players: Player[] = [];
    isLocked: boolean = false;
    private router: Router = inject(Router);

    ngOnInit(): void {
        this.players = [
            {
                id: '1',
                name: 'SELIM',
                avatar: Avatars.Avatar3,
                playerStats: {
                    health: 6,
                    speed: 5,
                    attack: 10,
                    defense: 4,
                    attackDice: 'd6',
                    defenseDice: 'd4',
                },
                currentStats: {
                    health: 6,
                    items: [],
                    position: { x: 0, y: 0 },
                    speed: 5,
                    action: 2,
                },
                isAdmin: true,
                isConnected: true,
            },
            {
                id: '2',
                name: 'OMAR',
                avatar: Avatars.Avatar2,
                playerStats: {
                    health: 4,
                    speed: 6,
                    attack: 8,
                    defense: 5,
                    attackDice: 'd8',
                    defenseDice: 'd6',
                },
                currentStats: {
                    health: 4,
                    items: [],
                    position: { x: 1, y: 1 },
                    speed: 6,
                    action: 2,
                },
                isAdmin: false,
                isConnected: true,
            },
        ];
    }

    startGame(): void {
        this.router.navigate(['/']);
    }

    leaveLobby(): void {
        this.router.navigate(['/']);
    }
    toggleLock(): void {
        this.isLocked = !this.isLocked;
    }
}
