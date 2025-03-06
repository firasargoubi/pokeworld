import { LobbyEvents } from '@common/lobby-events.enum';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CODE_LENGTH, CODE_RANGE, NEW_PLAYER } from './lobby.gateway.constants';

@WebSocketGateway({ cors: true })
@Injectable()
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    private matches: Map<string, Player[]> = new Map(); // gameCode -> joueurs
    private playerToMatch: Map<string, string> = new Map(); // player's socket.id -> gameCode

    @SubscribeMessage(LobbyEvents.CreateGame)
    createMatchAndJoin(socket: Socket): string {
        const gameCode = this.generateUniqueGameCode();
        this.matches.set(gameCode, []);

        const newPlayer = { ...NEW_PLAYER, id: socket.id, name: 'Admin', isAdmin: true };
        this.addPlayerToRoom(newPlayer, gameCode, socket);
        this.emitPlayersInRoom(gameCode);

        return gameCode;
    }

    @SubscribeMessage(LobbyEvents.JoinGame)
    joinMatch(socket: Socket, gameCode: string): boolean {
        if (!this.matches.has(gameCode)) {
            this.debug("La partie n'existe pas");
            return false;
        }
        if (this.playerToMatch.get(socket.id) === gameCode) {
            this.debug('Vous êtes déjà dans cette partie');
            return false;
        }

        const newPlayer = structuredClone(NEW_PLAYER);
        newPlayer.id = socket.id;
        newPlayer.name = `Player-${this.matches.get(gameCode).length + 1}`;

        this.addPlayerToRoom(newPlayer, gameCode, socket);
        this.emitPlayersInRoom(gameCode);

        return true;
    }

    @SubscribeMessage(LobbyEvents.LeaveGame)
    leaveGame(socket: Socket): boolean {
        const gameCode = this.playerToMatch.get(socket.id);
        if (!gameCode) return false;

        const playersInRoom = this.matches.get(gameCode);
        const leavingPlayer = playersInRoom?.find((player) => player.id === socket.id);

        if (leavingPlayer?.isAdmin) {
            this.destroyRoom(gameCode);
        } else {
            this.removePlayerFromRoom(socket, gameCode);
            this.emitPlayersInRoom(gameCode);
        }

        return true;
    }

    @SubscribeMessage(LobbyEvents.UpdatePlayer)
    updatePlayer(socket: Socket, updatedFields: Partial<Player>): boolean {
        const gameCode = this.playerToMatch.get(socket.id);
        if (!gameCode) return false;

        const players = this.matches.get(gameCode);
        const player = players.find((p) => p.id === socket.id);
        if (!player) return false;

        Object.assign(player, updatedFields);
        if (updatedFields.name) {
            player.name = this.generateUniqueName(players, updatedFields.name, socket.id);
        }

        this.emitPlayersInRoom(gameCode);
        return true;
    }

    // Sprint 3 - Chat
    // @SubscribeMessage(LobbyEvents.NewMessage)
    // sendMessageToPlayersInRoom(socket: Socket, message: string) {
    //     const gameCode = this.playerToMatch.get(socket.id);
    //     if (gameCode) {
    //         this.server.to(gameCode).emit(LobbyEvents.NewMessage, message);
    //     }
    // }

    handleConnection(socket: Socket) {
        socket.emit(LobbyEvents.Debug, 'Hello World!');
    }

    handleDisconnect(socket: Socket) {
        socket.emit(LobbyEvents.Debug, 'Goodbye World!');
        this.leaveGame(socket);
    }

    debug(message: string) {
        this.server.emit(LobbyEvents.Debug, message);
    }

    private removePlayerFromRoom(socket: Socket, gameCode: string): void {
        const playersInRoom = this.matches.get(gameCode);
        if (!playersInRoom) return;
        const updatedPlayers = playersInRoom.filter((player) => player.id !== socket.id);

        this.playerToMatch.delete(socket.id);
        socket.leave(gameCode);

        if (updatedPlayers.length === 0) {
            this.destroyRoom(gameCode);
        } else {
            this.matches.set(gameCode, updatedPlayers);
        }
    }

    private destroyRoom(gameCode: string): void {
        const playersInRoom = this.matches.get(gameCode);
        if (playersInRoom) {
            this.server.to(gameCode).emit(LobbyEvents.GameDestroyed, { gameCode });
            playersInRoom.forEach((player) => {
                const socket = this.server.sockets.sockets.get(player.id);
                if (socket) socket.leave(gameCode);
            });
            this.matches.delete(gameCode);
        }
    }

    private addPlayerToRoom(player: Player, gameCode: string, socket: Socket): void {
        this.leaveGame(socket);
        this.matches.get(gameCode).push(player);
        this.playerToMatch.set(player.id, gameCode);
        socket.join(gameCode);
    }

    private emitPlayersInRoom(gameCode: string): void {
        const playersInRoom = this.matches.get(gameCode);
        if (playersInRoom) {
            this.server.to(gameCode).emit(LobbyEvents.UpdatePlayersLists, playersInRoom);
        }
    }

    private generateUniqueGameCode(): string {
        let code: string;
        do {
            code = Math.floor(Math.random() * CODE_RANGE)
                .toString()
                .padStart(CODE_LENGTH, '0');
        } while (this.matches.has(code));
        return code;
    }

    private generateUniqueName(players: Player[], baseName: string, currentPlayerId: string): string {
        let newName = baseName;
        let suffix = 2;

        while (players.some((p) => p.name === newName && p.id !== currentPlayerId)) {
            newName = `${baseName}-${suffix}`;
            suffix++;
        }

        return newName;
    }
}
