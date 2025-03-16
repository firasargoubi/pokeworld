import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerCardComponent } from '@app/components/player-card/player-card.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Avatars } from '@common/avatars.enum';
import { MAX_PLAYERS } from '@common/max-players.const';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
// import { PopupService } from '@app/services/popup/popup.service';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    imports: [CommonModule, HeaderComponent, PlayerCardComponent, PokeballButtonComponent],
    standalone: true,
})
export class LobbyPageComponent {
    playerTest = {
        id: '1',
        name: 'Player',
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
        isAdmin: false,
        isConnected: true,
    };

    accessCode: string = '';
    isAdmin: boolean = false;
    players$: Observable<Player[]>;
    isRoomLocked: boolean;
    isSelfAdmin: boolean = false;
    selfId: string | undefined;
    availebelPlayers: null[];

    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);
    private coreSocket: CoreSocketService = inject(CoreSocketService);
    private popupService: PopupService = inject(PopupService);
    private gameDataService = inject(GameDataService);

    constructor() {
        if (this.lobbySocketsService.matchCode === '') {
            this.router.navigate(['/']);
        }
        this.players$ = this.lobbySocketsService.players$;
        this.selfId = this.coreSocket.selfId;

        this.players$.subscribe((players) => {
            const adminPlayer = players.find((player) => player.isAdmin === true);
            this.isSelfAdmin = adminPlayer?.id === this.selfId;

            const maxPlayersCount = MAX_PLAYERS[this.gameDataService.getMapSize()];
            const connectedPlayers = players.filter((player) => player.isConnected === true);
            this.availebelPlayers = Array.from({ length: maxPlayersCount - connectedPlayers.length });
        });

        this.lobbySocketsService.roomLocked$.subscribe((isRoomLocked) => {
            this.isRoomLocked = isRoomLocked;
        });
    }

    get matchCode(): string | null {
        return this.lobbySocketsService.matchRoomCode;
    }

    startMatchButton(): void {
        this.lobbySocketsService.startMatch();
    }

    leaveLobbyButton(): void {
        this.popupService.showPopup('Voulez-vous vraiment quitter ?', true, this.lobbySocketsService.leaveMatch.bind(this.lobbySocketsService));
    }

    toggleLockRoom(): void {
        this.isRoomLocked = !this.isRoomLocked;
        this.lobbySocketsService.changeLockStatus(this.isRoomLocked);
    }

    kickPlayer(playerId: string): void {
        this.lobbySocketsService.kickPlayer(playerId);
    }

    copyMatchCode() {
        navigator.clipboard.writeText(this.matchCode || '');
    }
}
