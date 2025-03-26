import { MatchGateway } from '@app/gateways/match/match.gateway';
import { MatchService } from '@app/services/match/match.service';
import { DEFAULT_MATCH_DATA } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER, MAX_PLAYERS } from '@common/consts/player.const';
import { GameData } from '@common/interfaces/game-data';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { PlayerData } from '@common/interfaces/player-data';
import { Inject } from '@nestjs/common';

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
        this.changeLockStatus(false);
    }

    changeLockStatus(lockStatus: boolean) {
        if (lockStatus || this.isFull()) {
            this.data.lobbyData.isLocked = true;
            this.kickJoiningPlayers();
        } else {
            this.data.lobbyData.isLocked = false;
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

    isHost(playerId: string): boolean {
        const playerIdex = this.getPlayerIndex(playerId);
        return playerIdex === this.data.lobbyData.hostPlayerIndex;
    }

    getPlayer(playerId: string): PlayerData {
        return this.data.players.find((p) => p.id === playerId);
    }

    clearTimeout() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    kickPlayer(playerId: string, reason: string) {
        this.matchGateway.emitRemovedFromMatch(playerId, reason);
        this.matchService.disconnectPlayer(playerId);
        this.data.players = this.data.players.filter((p) => p.id !== playerId);
    }

    private kickJoiningPlayers() {
        const playerIdsToKick = this.data.players.filter((p) => !p.isConnected).map((p) => p.id);
        playerIdsToKick.forEach((playerId) => {
            this.kickPlayer(playerId, Message.LockedFromLobby);
        });
    }

    private hostLeaveLobby(hostId: string) {
        this.data.players = this.data.players.filter((p) => p.id !== hostId);
        const playerIdsToKick = this.data.players.map((p) => p.id);
        playerIdsToKick.forEach((playerId) => {
            this.kickPlayer(playerId, Message.AdminQuit);
        });
    }

    private playerLeaveLobby(playerId: string) {
        this.data.players = this.data.players.filter((p) => p.id !== playerId);
        this.data.lobbyData.isLocked = false;
        this.sendUpdate();
    }

    private playerLeaveMatch(playerId: string) {
        const player = this.data.players.find((p) => p.id === playerId);
        player.isConnected = false;

        const connectedPlayers = this.data.players.filter((p) => p.isConnected);
        if (connectedPlayers.length === 1) {
            this.kickPlayer(connectedPlayers[0].id, Message.LastPlayerRemaining);
        } else {
            this.sendMessage(`${player.name} a quitté la partie`);
            this.sendUpdate();
        }
    }

    private getPlayerIndex(playerId: string): number {
        return this.data.players.findIndex((p) => p.id === playerId);
    }
}
