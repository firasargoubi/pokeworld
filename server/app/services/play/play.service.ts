import { PlayGateway } from '@app/gateways/play/play.gateway';
import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Match, TurnPhase } from '@common/match';
import { Player } from '@common/player';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HALF_POINT, PRE_TURN_DURATION, TURN_DURATION } from './play.service.const';

@Injectable()
export class PlayService {
    @Inject(forwardRef(() => PlayGateway)) private readonly playGateway: PlayGateway;
    @Inject(MatchService) private readonly matchService: MatchService;
    @Inject(MovementService) private readonly movementService: MovementService;
    @Inject(CombatService) private readonly combatService: CombatService;

    getPossibleMoves(playerId: string): Position[] {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        return this.movementService.getPossibleMoves(this.matchService.getMatch(matchCode));
    }

    move(playerId: string, position: Position) {
        if (this.matchService.isActivePlayer(playerId)) {
            const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
            const player = this.matchService.getPlayer(playerId);
            const match = this.matchService.getMatch(matchCode);
            const shortestPath = this.movementService.getShortestPath(match, position);

            if (shortestPath.moveCost <= player.currentStats.movement) {
                player.currentStats.position = position;
                player.currentStats.movement -= shortestPath.moveCost;
                const playerIndex = match.matchData.players.findIndex((p) => p.id === playerId);
                this.playGateway.emitPlayerMoved(matchCode, { match, movement: shortestPath.path, playerIndex });
            }
        }
    }

    action(playerId: string, position: Position) {
        if (this.matchService.isActivePlayer(playerId)) {
            const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
            const match = this.matchService.getMatch(matchCode);
            const actions = this.movementService.getActions(match);

            if (actions.some((a) => a.x === position.x && a.y === position.y)) {
                match.matchData.players.find((p) => p.id === playerId).currentStats.hasAction = false;
                this.executeAction(position, match, playerId);
            }
        }
    }

    getHoverMoves(playerId: string, position: Position): Position[] {
        let moves = [];
        if (position.x >= 0 && position.y >= 0 && this.matchService.isActivePlayer(playerId)) {
            const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
            const player = this.matchService.getPlayer(playerId);
            const shortestPath = this.movementService.getShortestPath(this.matchService.getMatch(matchCode), position);
            if (shortestPath.moveCost <= player.currentStats.movement) {
                moves = shortestPath.path;
            }
        }
        return moves;
    }

    getActions(playerId: string): Position[] {
        let actions = [];

        if (this.matchService.isActivePlayer(playerId)) {
            const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
            const match = this.matchService.getMatch(matchCode);
            actions = this.movementService.getActions(match);
        }

        return actions;
    }

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

    changeDebugMode(playerId: string) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        if (matchCode) {
            const isAdmin = this.matchService.isPlayerAdmin(playerId);
            if (isAdmin) {
                const match = this.matchService.getMatch(matchCode);
                match.matchData.isDebugMode = !match.matchData.isDebugMode;
                this.playGateway.emitDebugModeChanged(matchCode, match);
            }
        }
    }

    private executeAction(position: Position, match: Match, playerId: string) {
        const player = match.matchData.players.find((p) => p.currentStats.position.x === position.x && p.currentStats.position.y === position.y);
        if (player) {
            this.startFight(playerId);
        } else {
            this.toggleBridgeTile(match, position);
        }
    }

    private startFight(playerId: string) {
        const matchCode = this.matchService.getMatchCodeFromPlayerId(playerId);
        const match = this.matchService.getMatch(matchCode);
        const turnData = this.matchService.getTurnData(matchCode);
        if (turnData.phaseTimeout) {
            clearTimeout(turnData.phaseTimeout);
            turnData.phaseTimeout = null;
        }
        const elapsedTime = Math.abs(new Date().getTime() - turnData.lastPhaseStartTime.getTime());
        match.matchData.currentTimer = match.matchData.currentTimer - elapsedTime;

        // eslint-disable-next-line no-console, @typescript-eslint/no-magic-numbers
        console.log('maxTimer', match.matchData.maxTimer / 1000);
        // eslint-disable-next-line no-console, @typescript-eslint/no-magic-numbers
        console.log('remainingTime', match.matchData.currentTimer / 1000);
        // eslint-disable-next-line no-console, @typescript-eslint/no-magic-numbers
        console.log('elapsedTime', elapsedTime / 1000);

        this.playGateway.emitPauseTurn(matchCode, match);

        // this.combatService.initiateCombat(playerId, tragetPlayerId);
    }

    private toggleBridgeTile(match: Match, position: Position) {
        const tile = match.gameData.mapData.tiles[position.x][position.y];
        if (tile === TileType.Bridge) {
            match.gameData.mapData.tiles[position.x][position.y] = TileType.BrokenBridge;
        } else if (tile === TileType.BrokenBridge) {
            match.gameData.mapData.tiles[position.x][position.y] = TileType.Bridge;
        }
        this.playGateway.emitBridgeChanged(match.matchData.code, match);
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
            turnData.phaseTimeout = null;
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
        const shuffledSpawnPoints = spawnPoints.sort(() => Math.random() - HALF_POINT).slice(0, match.matchData.players.length);
        match.gameData.mapData.items.Spawn = spawnPoints.filter((s) => shuffledSpawnPoints.includes(s));

        shuffledSpawnPoints.forEach((spawnPoint, i) => {
            match.matchData.players[i].spawnPoint = spawnPoint;
            match.matchData.players[i].currentStats.position = spawnPoint;
        });
    }
}
