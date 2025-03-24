import { MatchData, MatchState } from '@common/interfaces/match-data';
import { GameData } from '@common/interfaces/game-data';
import { DEFAULT_MATCH_DATA } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER, MAX_PLAYERS } from '@common/consts/player.const';
import { Inject } from '@nestjs/common';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { MatchService } from '@app/services/match/match.service';
import { Message } from '@common/interfaces/message.enum';

export class Match {
    @Inject(MatchGateway) private matchGateway: MatchGateway;
    @Inject(MatchService) private matchService: MatchService;
    data: MatchData = structuredClone(DEFAULT_MATCH_DATA);
    private lastTimeoutStart: Date = new Date();
    private timeout: NodeJS.Timeout | null = null;

    constructor(matchCode: string, gameData: GameData, playerId: string) {
        this.data.code = matchCode;
        this.data.gameData = gameData;
        this.data.players = [{ ...DEFAULT_PLAYER, id: playerId }];
    }

    sendUpdate() {
        this.matchGateway.emitUpdate(this.data.code, this.data);
    }

    sendMessage(message: string) {
        this.matchGateway.emitMessage(this.data.code, message);

        // TODO ajouter le message a l'historique du journal
    }

    join(playerId: string) {
        this.data.players.push({ ...DEFAULT_PLAYER, id: playerId });
        if (this.isFull()) {
            this.data.lobbyData.isLocked = true;
            this.kickJoiningPlayers();
        }
        this.sendUpdate();
    }

    leave(playerId: string) {
        if (this.data.state === MatchState.Lobby) {
            if (this.isHost(playerId)) {
                this.hostLeaveLobby(playerId);
            } else {
                this.playerLeaveLobby(playerId);
            }
        } else {
            this.playerLeaveMatch(playerId);
        }
    }

    getConnectedPlayerCount(): number {
        return this.data.players.filter((p) => p.isConnected).length;
    }

    isFull(): boolean {
        const maxPlayerCount = MAX_PLAYERS[this.data.gameData.mapData.size];
        return this.getConnectedPlayerCount() >= maxPlayerCount;
    }

    clearTimeout() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    private kickJoiningPlayers() {
        this.data.players.forEach((p) => {
            if (!p.isConnected) {
                this.matchGateway.emitMessage(p.id, Message.LockedFromLobby);
                this.matchService.disconnectPlayer(p.id);
            }
        });
        this.data.players = this.data.players.filter((p) => p.isConnected);
    }

    private hostLeaveLobby(playerId: string) {
        this.matchGateway.emitMessage(this.data.code, Message.AdminQuit);
        this.data.players.forEach((p) => {
            if (p.id !== playerId) {
                this.matchService.disconnectPlayer(p.id);
            }
        });
        this.data.players = [];
    }

    private playerLeaveLobby(playerId: string) {
        this.data.players = this.data.players.filter((p) => p.id !== playerId);
        this.data.lobbyData.isLocked = false;
        this.sendUpdate();
    }

    private playerLeaveMatch(playerId: string) {
        const player = this.data.players.find((p) => p.id === playerId);
        player.isConnected = false;

        if (this.getConnectedPlayerCount() <= 1) {
            this.matchGateway.emitMessage(this.data.code, Message.LastPlayerRemaining);
            this.data.players = [];
        } else {
            this.sendMessage(`${player.name} a quitté la partie`);
            this.sendUpdate();
        }
    }

    private isHost(playerId: string): boolean {
        const playerIdex = this.getPlayerIndex(playerId);
        return playerIdex === this.data.lobbyData.hostPlayerIndex;
    }

    private getPlayerIndex(playerId: string): number {
        return this.data.players.findIndex((p) => p.id === playerId);
    }

    private getUniqueName(name: string, playerId: string): string {
        // TODO
        let newName = name;
        let suffix = 2;
        while (this.data.players.some((p) => p.name === newName && p.id !== playerId)) {
            newName = `${name}-${suffix}`;
            suffix++;
        }
        return newName;
    }
}
