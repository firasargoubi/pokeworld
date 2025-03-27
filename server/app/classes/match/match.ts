import { MatchService } from '@app/services/match/match.service';
import { DEFAULT_PLAYER_DATA, MAX_PLAYERS } from '@common/consts/player-data.const';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { PlayerData } from '@common/interfaces/player-data';

export class Match {
    data: MatchData;
    private matchService: MatchService;
    private lastTimeoutStart: Date = new Date();
    private timeout: NodeJS.Timeout | null = null;

    constructor(matchData: MatchData, matchService: MatchService) {
        this.data = matchData;
        this.matchService = matchService;
    }

    sendUpdate() {
        this.matchService.sendUpdate(this.data);
    }

    sendMessage(message: string) {
        this.matchService.sendMessage(this.data.code, message);

        // TODO ajouter le message a l'historique du journal

        this.sendUpdate();
    }

    join(playerId: string) {
        this.data.players.push({ ...structuredClone(DEFAULT_PLAYER_DATA), id: playerId });
        this.changeLockStatus(false);
        this.sendUpdate();
    }

    changeLockStatus(lockStatus: boolean) {
        if (lockStatus || this.isFull()) {
            this.data.lobbyData.isLocked = true;
            this.kickJoiningPlayers();
        } else {
            this.data.lobbyData.isLocked = false;
        }
    }

    leave(playerId: string) {
        if (this.data.state === MatchState.Lobby) {
            if (this.isHost(playerId)) {
                this.hostLeaveLobby(playerId);
            } else {
                this.playerLeaveLobby(playerId);
            }
        } else if (this.data.state === MatchState.MatchEnd) {
            this.playerLeaveStats(playerId);
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
        this.matchService.playerRemovedFromMatch(playerId, reason);
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
        this.changeLockStatus(false);
        this.sendUpdate();
    }

    // eslint-disable-next-line no-unused-vars
    private playerLeaveStats(playerId: string) {
        // TODO a player has left the match while on the end of match stat screen
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
