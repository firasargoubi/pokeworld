import { MatchData, MatchState } from '@common/interfaces/match-data';
import { GameData } from '@common/interfaces/game-data';
import { DEFAULT_MATCH_DATA } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER } from '@common/consts/player.const';

export class Match {
    data: MatchData = structuredClone(DEFAULT_MATCH_DATA);
    lastPhaseStartTime: Date = new Date();
    phaseTimeout: NodeJS.Timeout | null = null;

    constructor(matchCode: string, gameData: GameData, playerId: string) {
        this.data.code = matchCode;
        this.data.gameData = gameData;
        this.data.players = [{ ...DEFAULT_PLAYER, id: playerId }];
    }

    sendUpdate() {
        // TODO
    }

    join(playerId: string) {
        this.data.players.push({ ...DEFAULT_PLAYER, id: playerId });
        // TODO update lock state + kick joining players
    }

    leave(playerId: string) {
        if (this.data.state === MatchState.Lobby) {
            if (this.isHost(playerId)) {
                this.hostLeaveLobby(playerId);
            } else {
                this.playerLeaveLobby(playerId);
            }
        } else {
            this.playerLeaveStarted(playerId);
        }
    }

    // eslint-disable-next-line no-unused-vars
    endTurn(playerId: string) {
        // TODO
    }

    // eslint-disable-next-line no-unused-vars
    private hostLeaveLobby(playerId: string) {
        // TODO
    }

    // eslint-disable-next-line no-unused-vars
    private playerLeaveLobby(playerId: string) {
        // TODO
    }

    // eslint-disable-next-line no-unused-vars
    private playerLeaveStarted(playerId: string) {
        // TODO
    }

    private isHost(playerId: string): boolean {
        const playerIdex = this.getPlayerIndex(playerId);
        return playerIdex === this.data.lobbyData.hostPlayerIndex;
    }

    private getPlayerIndex(playerId: string): number {
        return this.data.players.findIndex((p) => p.id === playerId);
    }

    private getUniqueName(name: string, playerId: string): string {
        let newName = name;
        let suffix = 2;
        while (this.data.players.some((p) => p.name === newName && p.id !== playerId)) {
            newName = `${name}-${suffix}`;
            suffix++;
        }
        return newName;
    }
}
