import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';

const ACCESS_CODE_MIN = 1000;
const ACCESS_CODE_RANGE = 9000;

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

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.generateAccessCode();
    }

    generateAccessCode(): void {
        this.accessCode = Math.floor(ACCESS_CODE_MIN + Math.random() * ACCESS_CODE_RANGE).toString();
    }

    startGame(): void {
        this.router.navigate(['/']);
    }

    leaveLobby(): void {
        this.router.navigate(['/']);
    }
}
