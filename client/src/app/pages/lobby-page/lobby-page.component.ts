import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';

const CODE_LENGHT = 4;
const ACCESS_CODE_RANGE = 10000;

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    imports: [CommonModule, HeaderComponent, PokeballButtonComponent],
    standalone: true,
})
export class LobbyPageComponent implements OnInit {
    accessCode: string = '';
    players: string[] = ['Host'];
    private router: Router = inject(Router);

    ngOnInit(): void {
        this.generateAccessCode();
    }

    startGame(): void {
        this.router.navigate(['/']);
    }

    leaveLobby(): void {
        this.router.navigate(['/']);
    }

    private generateAccessCode(): void {
        this.accessCode = Math.floor(Math.random() * ACCESS_CODE_RANGE)
            .toString()
            .padStart(CODE_LENGHT, '0');
    }
}
