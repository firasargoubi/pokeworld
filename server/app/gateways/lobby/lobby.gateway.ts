import { LobbyEvents } from '@common/lobby-events.enum';
import { Player } from '@common/player';
import { Match } from '@common/match';
import { GameData } from '@common/game-data';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CODE_LENGTH, CODE_RANGE, NEW_PLAYER, MAX_PLAYERS } from './lobby.gateway.constants';

@WebSocketGateway({ cors: true })
@Injectable()
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    private matches: Map<string, Match> = new Map(); // gameCode -> Match
    private playerToMatch: Map<string, string> = new Map(); // player's socket.id -> gameCode

    @SubscribeMessage(LobbyEvents.CreateGame)
    createMatchAndJoin(socket: Socket, gameData: GameData): string {
        const gameCode = this.generateUniqueGameCode();

        const match: Match = {
            gameData,
            matchData: {
                gameCode,
                players: [],
                isLocked: false,
            },
        };

        this.matches.set(gameCode, match);

        const newPlayer = structuredClone(NEW_PLAYER);
        newPlayer.id = socket.id;
        newPlayer.name = 'Admin';
        newPlayer.isAdmin = true;
        newPlayer.isConnected = true;
        this.addPlayerToRoom(newPlayer, gameCode, socket);
        this.emitPlayersInRoom(gameCode);

        return gameCode;
    }

    @SubscribeMessage(LobbyEvents.JoinGame)
    joinMatch(socket: Socket, gameCode: string): boolean {
        const match = this.matches.get(gameCode);
        if (!match) {
            this.debug(socket, "La partie n'existe pas");
            return false;
        }
        if (match.matchData.isLocked) {
            this.debug(socket, 'Cette partie est verrouillée ou pleine');
            return false;
        }
        if (this.playerToMatch.get(socket.id) === gameCode) {
            this.debug(socket, 'Vous êtes déjà dans cette partie');
            return false;
        }

        const newPlayer = structuredClone(NEW_PLAYER);
        newPlayer.id = socket.id;
        newPlayer.name = `Player-${match.matchData.players.length + 1}`;

        this.addPlayerToRoom(newPlayer, gameCode, socket);
        this.updateRoomLockStatus(match, gameCode);
        this.emitPlayersInRoom(gameCode);
        return true;
    }

    @SubscribeMessage(LobbyEvents.LeaveGame)
    leaveGame(socket: Socket): boolean {
        const gameCode = this.playerToMatch.get(socket.id);
        if (!gameCode) return false;

        const match = this.matches.get(gameCode);

        const playersInRoom = match.matchData.players;
        const leavingPlayer = playersInRoom.find((player) => player.id === socket.id);

        if (leavingPlayer.isAdmin) {
            this.destroyRoom(gameCode);
        } else {
            this.removePlayerFromRoom(socket, gameCode);
            this.updateRoomLockStatus(match, gameCode);
            this.emitPlayersInRoom(gameCode);
        }

        return true;
    }

    @SubscribeMessage(LobbyEvents.UpdatePlayer)
    updatePlayer(socket: Socket, updatedFields: Partial<Player>): boolean {
        const gameCode = this.playerToMatch.get(socket.id);
        if (!gameCode) return false;

        const match = this.matches.get(gameCode);
        const player = match.matchData.players.find((p) => p.id === socket.id);
        if (!player) return false;

        Object.assign(player, updatedFields);
        if (updatedFields.name) {
            player.name = this.generateUniqueName(match.matchData.players, updatedFields.name, socket.id);
        }

        this.updateRoomLockStatus(match, gameCode);

        this.emitPlayersInRoom(gameCode);
        return true;
    }

    @SubscribeMessage(LobbyEvents.ToggleLockRoom)
    toggleLockRoom(socket: Socket, shouldLock: boolean): boolean {
        const gameCode = this.playerToMatch.get(socket.id);
        if (!gameCode) return false;

        const match = this.matches.get(gameCode);
        const player = match.matchData.players.find((p) => p.id === socket.id);

        if (!player.isAdmin) return false;

        if (!shouldLock) {
            const connectedPlayerCount = match.matchData.players.filter((p) => p.isConnected).length;
            const maxPlayers = MAX_PLAYERS[match.gameData.mapData.size];

            if (connectedPlayerCount >= maxPlayers) {
                this.debug(socket, `Impossible de déverrouiller: nombre maximum de joueurs atteint (${maxPlayers})`);
                return false;
            }
        }

        match.matchData.isLocked = shouldLock;
        this.server.to(gameCode).emit(LobbyEvents.RoomLockChanged, shouldLock);
        return true;
    }

    handleConnection(socket: Socket) {
        socket.emit(LobbyEvents.Debug, 'Hello World!');
    }

    handleDisconnect(socket: Socket) {
        socket.emit(LobbyEvents.Debug, 'Goodbye World!');
        this.leaveGame(socket);
    }

    debug(socket, message: string) {
        socket.emit(LobbyEvents.Debug, message);
    }

    getPlayerById(playerId: string): Player {
        const gameCode = this.playerToMatch.get(playerId);
        if (!gameCode) return null;

        const match = this.matches.get(gameCode);
        if (!match || !match.matchData) return null;

        return match.matchData.players.find((p) => p.id === playerId);
    }

    private removePlayerFromRoom(socket: Socket, gameCode: string): void {
        const match = this.matches.get(gameCode);
        if (!match) return;

        match.matchData.players = match.matchData.players.filter((player) => player.id !== socket.id);
        this.playerToMatch.delete(socket.id);
        socket.leave(gameCode);

        if (match.matchData.players.length === 0) {
            this.destroyRoom(gameCode);
        }
    }

    private destroyRoom(gameCode: string): void {
        const match = this.matches.get(gameCode);
        if (match) {
            this.server.to(gameCode).emit(LobbyEvents.GameDestroyed, { gameCode });
            match.matchData.players.forEach((player) => {
                const socket = this.server.sockets.sockets.get(player.id);
                if (socket) socket.leave(gameCode);
                this.playerToMatch.delete(player.id);
            });
            this.matches.delete(gameCode);
        }
    }

    private addPlayerToRoom(player: Player, gameCode: string, socket: Socket): void {
        this.leaveGame(socket);
        const match = this.matches.get(gameCode);
        if (match) {
            match.matchData.players.push(player);
            this.playerToMatch.set(player.id, gameCode);
            socket.join(gameCode);
        }
    }

    private emitPlayersInRoom(gameCode: string): void {
        const match = this.matches.get(gameCode);
        if (match) {
            this.server.to(gameCode).emit(LobbyEvents.UpdatePlayersLists, match.matchData.players);
        }
    }

    private updateRoomLockStatus(match: Match, gameCode: string): void {
        const maxPlayers = MAX_PLAYERS[match.gameData.mapData.size];
        const connectedPlayerCount = match.matchData.players.filter((player) => player.isConnected).length;

        if (connectedPlayerCount >= maxPlayers && !match.matchData.isLocked) {
            match.matchData.isLocked = true;
            this.server.to(gameCode).emit(LobbyEvents.RoomLockChanged, true);
        } else if (connectedPlayerCount < maxPlayers && match.matchData.isLocked) {
            match.matchData.isLocked = false;
            this.server.to(gameCode).emit(LobbyEvents.RoomLockChanged, false);
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
