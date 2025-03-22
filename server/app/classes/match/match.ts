import { MatchData, MatchState } from '@common/interfaces/match-data';
import { GameData } from '@common/interfaces/game-data';
import { DEFAULT_MATCH_DATA } from '@common/consts/match-data.const';

export class Match {
    data: MatchData = structuredClone(DEFAULT_MATCH_DATA);
    lastPhaseStartTime: Date = new Date();
    phaseTimeout: NodeJS.Timeout | null = null;

    constructor(matchCode: string, gameData: GameData) {
        this.data.code = matchCode;
        this.data.gameData = gameData;
    }

    sendUpdate() {
        // TODO
    }

    leaveMatch(playerId: string) {
        if (this.data.state === MatchState.Lobby) {
            if (this.isAdmin(playerId)) {
                adminLeftLobby();
            } else {
                playerLeftLobby();
            }
        } else {
            leaveMatchStarted();
        }
    }

    // eslint-disable-next-line no-unused-vars
    endTurn(playerId: string) {
        // TODO
    }

    private isAdmin(playerId: string): boolean {
        const playerIdex = this.getPlayerIndex(playerId);
        return playerIdex === this.data.lobbyData.adminPlayerIndex;
    }

    private getPlayerIndex(playerId: string): number {
        return this.data.players.findIndex((p) => p.id === playerId);
    }
}
