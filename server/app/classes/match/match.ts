import { MatchService } from '@app/services/match/match.service';
import { OUTSIDE_OF_MAP } from '@common/consts/map-data.const';
import { DEFAULT_PLAYER_DATA, MAX_PLAYERS } from '@common/consts/player-data.const';
import { MatchData, MatchSettings, MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, PlayerData, PlayerType } from '@common/interfaces/player-data';
import { Position } from '@common/interfaces/position';

export class Match {
    data: MatchData;
    lastTimeoutStart: Date = new Date();
    private matchService: MatchService;
    private timeout: NodeJS.Timeout | null = null;
    private botTimeout: NodeJS.Timeout | null = null;
    private availableSpawnPoints: Position[] = [];
    private dropOutVictories: Map<string, number> = new Map();

    constructor(matchData: MatchData, matchService: MatchService) {
        this.data = matchData;
        this.matchService = matchService;
    }

    sendUpdate() {
        this.matchService.sendUpdate(this);
    }

    sendMessage(message: string, messageParams?: Record<string, string | number | boolean>) {
        this.sendUpdate();
        this.matchService.sendMessage(this.data.code, message, messageParams);
    }

    sendMessageToHost(message: string, messageParams?: Record<string, string | number | boolean>) {
        this.sendUpdate();
        this.matchService.sendMessage(this.data.players[this.data.lobbyData.hostPlayerIndex].id, message, messageParams);
    }

    setTimeout(callback: () => void, duration: number) {
        this.clearTimeout();
        this.lastTimeoutStart = new Date();
        this.timeout = setTimeout(callback, duration);
    }

    setBotTimeout(callback: () => void, duration: number) {
        if (!this.botTimeout) {
            this.botTimeout = setTimeout(() => {
                this.botTimeout = null;
                callback();
            }, duration);
        }
    }

    isState(states: MatchState[]): boolean {
        return states.includes(this.data.state);
    }

    join(playerId: string) {
        this.data.players.push({ ...structuredClone(DEFAULT_PLAYER_DATA), id: playerId });
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

    changeSettings(matchSettings: MatchSettings) {
        this.data.playData.isElementalMode = matchSettings.isElementalMode;
        this.data.lobbyData.isDropInEnabled = matchSettings.isDropInEnabled;
        this.data.lobbyData.isRapidElimination = matchSettings.isRapidElimination;
    }

    leave(playerId: string): void {
        switch (this.data.state) {
            case MatchState.Lobby:
                return this.isHost(playerId) ? this.hostLeaveLobby(playerId) : this.playerLeaveLobby(playerId);
            case MatchState.Statistics:
            case MatchState.MatchEnd:
                return this.playerLeaveStats(playerId);
            case MatchState.CombatAnimation:
            case MatchState.CombatWait:
                this.playerLeaveCombat(playerId);
        }
        return this.playerLeaveMatch(playerId);
    }

    getConnectedPlayerCount(): number {
        return this.data.players.filter((p) => p.isConnected && p.type === PlayerType.Player).length;
    }

    isFull(): boolean {
        const maxPlayerCount = MAX_PLAYERS[this.data.gameData.mapData.size];
        return this.data.players.filter((p) => p.isConnected).length >= maxPlayerCount;
    }

    isHost(playerId: string): boolean {
        const playerIdex = this.getPlayerIndex(playerId);
        return playerIdex === this.data.lobbyData.hostPlayerIndex;
    }

    isActivePlayer(playerId: string): boolean {
        const playerIdex = this.getPlayerIndex(playerId);
        return playerIdex === this.data.playData.activePlayerIndex;
    }

    getPlayer(playerId: string): PlayerData {
        return this.data.players.find((p) => p.id === playerId);
    }

    getPlayerIndex(playerId: string): number {
        return this.data.players.findIndex((p) => p.id === playerId);
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    clearBotTimeout() {
        if (this.botTimeout) {
            clearTimeout(this.botTimeout);
            this.botTimeout = null;
        }
    }

    kickPlayer(playerId: string, reason: string) {
        this.matchService.playerRemovedFromMatch(playerId, reason);
        this.data.players = this.data.players.filter((p) => p.id !== playerId);
    }

    setAvailableSpawnPoints(spawnPoints: Position[]) {
        this.availableSpawnPoints = spawnPoints.map((spawnPoint) => structuredClone(spawnPoint));
    }

    hasAvailableSpawnPoint(): boolean {
        return this.availableSpawnPoints.length > 0;
    }

    getNextAvailableSpawnPoint(): Position | null {
        return this.availableSpawnPoints.length ? this.availableSpawnPoints.shift() ?? null : null;
    }

    releaseSpawnPoint(spawnPoint: Position) {
        if (spawnPoint.x >= 0 && spawnPoint.y >= 0) {
            this.availableSpawnPoints.push(structuredClone(spawnPoint));
        }
    }

    storePlayerVictories(playerUserId: string, victories: number) {
        this.dropOutVictories.set(playerUserId, victories);
    }

    getPlayerVictories(playerUserId: string): number | undefined {
        const victories = this.dropOutVictories.get(playerUserId);
        this.dropOutVictories.delete(playerUserId);
        return victories;
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
        this.sendUpdate();
    }

    private playerLeaveCombat(playerId: string) {
        const playerIndex = this.getPlayerIndex(playerId);
        if (this.data.combatData.playersCombatData[0].playerIndex === playerIndex) {
            this.data.combatData.isSecondPlayerTurn = false;
        } else if (this.data.combatData.playersCombatData[1].playerIndex === playerIndex) {
            this.data.combatData.isSecondPlayerTurn = true;
        }
        this.matchService.killPlayerCombat(this);
    }

    private playerLeaveStats(playerId: string) {
        const player = this.data.players.find((p) => p.id === playerId);
        player.isConnected = false;
        this.sendMessage(Message.PlayerLeftMatch, { playerName: player.name });
    }

    private playerLeaveMatch(playerId: string) {
        const player = this.data.players.find((p) => p.id === playerId);
        if (!player) {
            return;
        }
        player.isConnected = false;
        player.avatar = Avatar.Default;
        player.id = player.userId ?? player.id;
        if (this.data.lobbyData.isDropInEnabled && player.spawnPoint.x >= 0 && player.spawnPoint.y >= 0) {
            this.releaseSpawnPoint(player.spawnPoint);
            this.data.gameData.mapData.items.Spawn = this.data.gameData.mapData.items.Spawn.filter(
                (spawnPoint) => spawnPoint.x !== player.spawnPoint.x || spawnPoint.y !== player.spawnPoint.y,
            );
            if (player.userId) {
                this.storePlayerVictories(player.userId, player.combatsWon);
            }
        }
        const connectedPlayers = this.data.players.filter((p) => p.isConnected);
        if (connectedPlayers.length === 1) {
            this.kickPlayer(connectedPlayers[0].id, Message.LastPlayerRemaining);
        } else {
            if (this.isActivePlayer(player.id) && this.isState([MatchState.TurnWait])) {
                this.matchService.startNextTurn(this);
            }
            player.spawnPoint = structuredClone(OUTSIDE_OF_MAP);
            this.matchService.respawnPlayer(this, player);
            this.sendMessage(Message.PlayerLeftMatch, { playerName: player.name });
        }
    }
}
