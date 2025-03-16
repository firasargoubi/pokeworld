import { PlayGateway } from '@app/gateways/play/play.gateway';
import { MatchService } from '@app/services/match/match.service';
import { Match, TurnPhase } from '@common/match';
import { Player } from '@common/player';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HALF_POINT, PRE_TURN_DURATION, TURN_DURATION } from './play.service.const';

@Injectable()
export class PlayService {
    @Inject(forwardRef(() => PlayGateway)) private readonly playGateway: PlayGateway;
    @Inject(MatchService) private readonly matchService: MatchService;

    startMatch(matchCode: string) {
        const match = this.matchService.getMatch(matchCode);
        this.reorganizeMatch(match);
        this.playGateway.emitMatchStarted(matchCode, match);
        this.nextTurnPhase(matchCode);
    }

    endTurn(playerId: string) {
        if (this.canEndTurn(playerId)) {
            this.nextTurnPhase(this.matchService.getMatchCodeFromPlayerId(playerId));
        }
    }

    private canEndTurn(playerId: string): boolean {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const match = this.matchService.getMatch(matchCode);
        const playerIndex = match.matchData.players.findIndex((p) => p.id === playerId);
        const isActivePlayer = match.matchData.activePlayer === playerIndex;
        const isDuringTurnPhase = match.matchData.phase === TurnPhase.Turn;

        return isActivePlayer && isDuringTurnPhase;
    }

    private startPreTurn(match: Match) {
        this.depleteCurrentStats(match.matchData.players[match.matchData.activePlayer]);
        match.matchData.activePlayer = this.getNextCurrentIndex(match.matchData.players, match.matchData.activePlayer);
        this.playGateway.emitPreTurnStarted(match.matchData.code, match);
    }

    private startTurn(match: Match) {
        this.resetCurrentStats(match.matchData.players[match.matchData.activePlayer]);
        this.playGateway.emitTurnStarted(match.matchData.code, match);
    }

    private nextTurnPhase(matchCode: string) {
        const match = this.matchService.getMatch(matchCode);
        switch (match.matchData.phase) {
            case TurnPhase.PreTurn:
                match.matchData.phase = TurnPhase.Turn;
                this.startTurnTimer(match, TURN_DURATION);
                this.startTurn(match);
                break;
            case TurnPhase.Turn:
                match.matchData.phase = TurnPhase.PreTurn;
                this.startTurnTimer(match, PRE_TURN_DURATION);
                this.startPreTurn(match);
                break;
        }
    }

    private startTurnTimer(match: Match, duration: number) {
        const turnData = this.matchService.getTurnData(match.matchData.code);
        if (turnData.phaseTimeout) {
            clearTimeout(turnData.phaseTimeout);
        }
        turnData.lastPhaseStartTime = new Date();
        match.matchData.currentTimer = duration;
        match.matchData.maxTimer = duration;
        turnData.phaseTimeout = setTimeout(() => {
            this.nextTurnPhase(match.matchData.code);
        }, duration);
    }

    private resetCurrentStats(player: Player) {
        player.currentStats.hasAction = true;
        player.currentStats.health = player.playerStats.health;
        player.currentStats.movement = player.playerStats.speed;
    }

    private depleteCurrentStats(player: Player) {
        player.currentStats.hasAction = false;
        player.currentStats.movement = 0;
        player.currentStats.health = player.playerStats.health;
    }

    private getNextCurrentIndex(players: Player[], currentIndex: number): number {
        const totalPlayers = players.length;

        let nextIndex = (currentIndex + 1) % totalPlayers;

        let steps = 0;
        while (steps <= totalPlayers && !players[nextIndex].isConnected) {
            nextIndex = (nextIndex + 1) % totalPlayers;
            steps++;
        }

        return nextIndex;
    }

    private reorganizeMatch(match: Match) {
        match.matchData.activePlayer = match.matchData.players.length - 1;
        match.matchData.isStarted = true;
        match.matchData.isLocked = true;
        this.sortPlayers(match);
        this.assignSpawnPoints(match);
    }

    private sortPlayers(match: Match) {
        match.matchData.players = match.matchData.players.sort((a: Player, b: Player) => {
            if (a.playerStats.speed !== b.playerStats.speed) {
                return b.playerStats.speed - a.playerStats.speed;
            }
            return Math.random() - HALF_POINT;
        });
    }

    private assignSpawnPoints(match: Match) {
        const spawnPoints = match.gameData.mapData.items.Spawn;
        const shuffledSpawnPoints = spawnPoints.sort(() => Math.random() - 0.5).slice(0, match.matchData.players.length);
        
        shuffledSpawnPoints.forEach((spawnPoint, i) => {
            match.matchData.players[i].spawnPoint = spawnPoint;
            match.matchData.players[i].currentStats.position = spawnPoint;
        });
    }
}
