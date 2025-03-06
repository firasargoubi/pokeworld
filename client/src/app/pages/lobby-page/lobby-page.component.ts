import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatSocketsService } from '@app/services/sockets/chat-socket/chat-socket.service'; // Importez le service de chat
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-lobby',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
    standalone: true,
    imports: [FormsModule, CommonModule],
})
export class LobbyPageComponent {
    joinRoomCode: string = ''; // Code de la room à rejoindre
    updatedPlayerName: string = ''; // Nouveau nom pour la mise à jour du joueur
    players$: Observable<Player[]>; // Liste des joueurs dans la room
    newMessage: string = ''; // Message en cours de saisie
    chatMessages$: Observable<string[]>; // Historique des messages du chat
    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);
    private chatSocketsService: ChatSocketsService = inject(ChatSocketsService); // Injectez le service de chat

    constructor() {
        this.players$ = this.lobbySocketsService.players$;
        this.chatMessages$ = this.chatSocketsService.chatMessages;
    }

    get matchCode(): string | null {
        return this.lobbySocketsService.matchRoomCode;
    }

    leaveRoom(): void {
        this.lobbySocketsService.leaveGame();
    }
}
