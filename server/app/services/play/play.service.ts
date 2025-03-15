import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MatchService } from '@app/services/match/match.service';
import { PlayGateway } from '@app/gateways/play/play.gateway';
import { Player } from '@common/player';
import { HALF_POINT, PRE_TURN_DURATION, TURN_DURATION } from './match.service.const';
import { Match, TurnPhase } from '@common/match';

@Injectable()
export class PlayService {
    @Inject(forwardRef(() => PlayGateway)) private readonly playGateway: PlayGateway;
    @Inject(MatchService) private readonly matchService: MatchService;

    startMatch(matchCode: string) {
        const match = this.matchService.getMatch(matchCode);
        this.sanitizeMatch(match);
        this.playGateway.emitMatchStarted(matchCode, match);
        this.nextTurnPhase(matchCode);
    }

    endTurn(playerId: string) {
        // eslint-disable-next-line no-console
        console.log('PlayService.endTurn()', playerId);
    }

    private startPreTurn(match: Match) {
        this.depleteCurrentStats(match.matchData.players[match.matchData.activePlayer]);
        this.playGateway.emitPreTurnStarted(match.matchData.code, match);
        // eslint-disable-next-line no-console
        console.log('startPreTurn()');
    }

    private startTurn(match: Match) {
        match.matchData.activePlayer = this.getNextCurrentIndex(match.matchData.players, match.matchData.activePlayer);
        this.resetCurrentStats(match.matchData.players[match.matchData.activePlayer]);
        this.playGateway.emitTurnStarted(match.matchData.code, match);
        // eslint-disable-next-line no-console
        console.log('startTurn()');
    }

    private nextTurnPhase(matchCode: string) {
        const match = this.matchService.getMatch(matchCode);
        switch (match.matchData.phase) {
            case TurnPhase.PreTurn:
                match.matchData.phase = TurnPhase.Turn;
                this.startTurn(match);
                this.startTurnTimer(match, TURN_DURATION);
                break;
            case TurnPhase.Turn:
                match.matchData.phase = TurnPhase.PreTurn;
                this.startPreTurn(match);
                this.startTurnTimer(match, PRE_TURN_DURATION);
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

    private sanitizeMatch(match: Match) {
        match.matchData.activePlayer = 0;
        match.matchData.isStarted = true;
        match.matchData.players = match.matchData.players.sort((a: Player, b: Player) => {
            if (a.playerStats.speed !== b.playerStats.speed) {
                return b.playerStats.speed - a.playerStats.speed;
            }
            return Math.random() - HALF_POINT;
        });
    }
}
