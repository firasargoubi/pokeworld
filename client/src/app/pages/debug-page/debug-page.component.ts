import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatSocketsService } from '@app/services/sockets/chat-socket/chat-socket.service'; // Importez le service de chat
import { CombatSocketService } from '@app/services/sockets/combat-socket/combat-socket.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-lobby',
    templateUrl: './debug-page.component.html',
    styleUrls: ['./debug-page.component.scss'],
    standalone: true,
    imports: [FormsModule, CommonModule],
})
export class DebugPageComponent {
    joinRoomCode: string = ''; // Code de la room à rejoindre
    updatedPlayerName: string = ''; // Nouveau nom pour la mise à jour du joueur
    players$: Observable<Player[]>; // Liste des joueurs dans la room
    newMessage: string = ''; // Message en cours de saisie
    chatMessages$: Observable<string[]>; // Historique des messages du chat
    isRoomLocked$: Observable<boolean>; // État de verrouillage de la room
    selfID: string | undefined = undefined; // id actuel
    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);
    private chatSocketsService: ChatSocketsService = inject(ChatSocketsService); // Injectez le service de chat
    private coreSocket: CoreSocketService = inject(CoreSocketService);
    private combatSocketService: CombatSocketService = inject(CombatSocketService);

    constructor() {
        this.players$ = this.lobbySocketsService.players$;
        this.chatMessages$ = this.chatSocketsService.chatMessages;
        this.isRoomLocked$ = this.lobbySocketsService.roomLocked$;
    }

    get matchCode(): string | null {
        return this.lobbySocketsService.matchRoomCode;
    }

    // Créer une room
    createRoom(): void {
        this.lobbySocketsService.createGame();
        this.selfID = this.coreSocket.selfId;
    }

    // Rejoindre une room
    joinRoom(): void {
        this.lobbySocketsService.joinGame(this.joinRoomCode).subscribe((joinStatus) => {
            if (joinStatus) {
                this.selfID = this.coreSocket.selfId;
            }
        });
        this.joinRoomCode = '';
        this.selfID = this.coreSocket.selfId;
    }

    // Quitter une room
    leaveRoom(): void {
        this.lobbySocketsService.leaveGame();
    }

    // Mettre à jour les informations du joueur
    updatePlayer(playerUpdates: Partial<Player>): void {
        this.lobbySocketsService.updatePlayer(playerUpdates);
        this.updatedPlayerName = ''; // Réinitialiser le champ
    }

    lockRoom() {
        this.lobbySocketsService.toggleLockRoom(true);
    }

    unlockRoom() {
        this.lobbySocketsService.toggleLockRoom(false);
    }

    // Envoyer un message dans le chat
    sendChatMessage(): void {
        if (this.newMessage.trim()) {
            this.chatSocketsService.sendMessage(this.newMessage);
            this.newMessage = '';
        }
    }

    startCombat(targetPlayerId: string): void {
        this.combatSocketService.initFight(targetPlayerId);
    }
}
