import { Match } from '@app/classes/match/match';
import { MovementService } from '@app/services/movement/movement.service';
import { MOVEMENT_ANIMATION_DURATION, TURN_START_DURATION, TURN_WAIT_DURATION } from '@common/consts/match-data.const';
import { MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PlayService {
    @Inject(MovementService) private readonly movementService: MovementService;

    endTurn(match: Match, playerId: string) {
        if (match.isActivePlayer(playerId) && match.isState(MatchState.TurnWait)) {
            this.startTurnStart(match);
        }
    }

    move(match: Match, playerId: string, position: Position) {
        if (match.isActivePlayer(playerId) && match.isState(MatchState.TurnWait)) {
            const shortestPath = this.movementService.getShortestPath(match.data, position);
            if (shortestPath.moveCost <= match.data.playData.movementLeft) {
                const player = match.getPlayer(playerId);
                player.position = position;
                match.data.playData.movementLeft -= shortestPath.moveCost;
                const elapsedTime = Math.abs(new Date().getTime() - match.lastTimeoutStart.getTime());
                match.data.playData.timeLeft = match.data.playData.timeLeft - elapsedTime;
                match.data.state = MatchState.MovementAnimation;
                match.sendUpdate();
                match.setTimeout(this.endOfMovementAnimation.bind(this, match), (shortestPath.path.length + 1) * MOVEMENT_ANIMATION_DURATION);
            }
        }
    }

    endOfMovementAnimation(match: Match) {
        match.data.state = MatchState.TurnWait;
        match.setTimeout(this.startTurnStart.bind(this, match), match.data.playData.timeLeft);
        match.sendUpdate();
    }

    action(match: Match, playerId: string, position: Position) {
        if (match.data.playData.hasAction && match.isActivePlayer(playerId) && match.isState(MatchState.TurnWait)) {
            const actions = this.movementService.getActions(match.data);
            if (actions.some((a) => a.x === position.x && a.y === position.y)) {
                match.data.playData.hasAction = false;
                this.executeAction(match, playerId, position);
            }
        }
    }

    debugMove(match: Match, playerId: string, position: Position) {
        if (match.data.playData.isDebugMode && match.isActivePlayer(playerId) && match.isState(MatchState.TurnWait)) {
            const possibleMoves = this.movementService.getPossibleMovesDebug(match.data);
            const isMoveValid = possibleMoves.some((m) => m.x === position.x && m.y === position.y);
            if (isMoveValid) {
                const player = match.getPlayer(playerId);
                player.position = position;
                match.sendUpdate();
            }
        }
    }

    changeDebugMode(match: Match, playerId: string, isDebugMode: boolean) {
        if (match.isHost(playerId) && match.isActivePlayer(playerId)) {
            match.data.playData.isDebugMode = isDebugMode;
            match.sendMessage(isDebugMode ? Message.DebugModeOn : Message.DebugModeOff);
        }
    }

    startTurnStart(match: Match) {
        match.data.state = MatchState.TurnStart;
        match.data.playData.hasAction = false;
        match.data.playData.movementLeft = 0;
        match.data.playData.timeLeft = TURN_WAIT_DURATION;
        match.data.playData.activePlayerIndex = this.getNextPlayerIndex(match);

        match.setTimeout(this.startTurnWait.bind(this, match), TURN_START_DURATION);
        const playerName = match.data.players[match.data.playData.activePlayerIndex].name;
        match.sendMessage(`Début du tour de ${playerName}`);
    }

    private startTurnWait(match: Match) {
        match.data.state = MatchState.TurnWait;
        match.data.playData.hasAction = true;
        match.data.playData.movementLeft = match.data.players[match.data.playData.activePlayerIndex].speed;

        match.setTimeout(this.startTurnStart.bind(this, match), TURN_WAIT_DURATION);
        match.sendUpdate();
    }

    private executeAction(match: Match, playerId: string, position: Position) {
        const targetPlayer = match.data.players.find((p) => p.position.x === position.x && p.position.y === position.y);
        if (targetPlayer) {
            this.startFight(match, playerId, targetPlayer.id);
        } else {
            this.toggleBridgeTile(match, position);
            match.sendUpdate();
        }
    }

    private toggleBridgeTile(match: Match, position: Position) {
        const tile = match.data.gameData.mapData.tiles[position.x][position.y];
        if (tile === TileType.Bridge) {
            match.data.gameData.mapData.tiles[position.x][position.y] = TileType.BrokenBridge;
        } else if (tile === TileType.BrokenBridge) {
            match.data.gameData.mapData.tiles[position.x][position.y] = TileType.Bridge;
        }
    }

    private getNextPlayerIndex(match: Match): number {
        let nextIndex = (match.data.playData.activePlayerIndex + 1) % match.data.players.length;
        let steps = 0;
        while (steps <= match.data.players.length && !match.data.players[nextIndex].isConnected) {
            nextIndex = (nextIndex + 1) % match.data.players.length;
            steps++;
        }
        return nextIndex;
    }

    private startFight(match: Match, playerId: string, targetPlayerId: string) {
        // TODO
        // eslint-disable-next-line no-console
        console.log('startFight', match.data.state, playerId, targetPlayerId);
        match.sendUpdate();

        // const match = this.matchService.getMatch(matchCode);
        // const turnData = this.matchService.getTurnData(matchCode);
        // if (turnData.phaseTimeout) {
        //     clearTimeout(turnData.phaseTimeout);
        //     turnData.phaseTimeout = null;
        // }
        // const player = this.matchService.getPlayer(matchCode, playerId);
        // const targetPlayer = this.matchService.getPlayer(matchCode, targetPlayerId);
        // const tiles = match.gameData.mapData.tiles;
        // player.currentStats.standingTile = tiles[player.currentStats.position.x][player.currentStats.position.y];
        // targetPlayer.currentStats.standingTile = tiles[targetPlayer.currentStats.position.x][targetPlayer.currentStats.position.y];

        // const elapsedTime = Math.abs(new Date().getTime() - turnData.lastPhaseStartTime.getTime());
        // match.matchData.currentTimer = match.matchData.currentTimer - elapsedTime;
        // this.playGateway.emitCombatDataBroadcast(matchCode, {
        //     match,
        //     playerOneIndex: this.matchService.getPlayerIndex(matchCode, playerId),
        //     playerTwoIndex: this.matchService.getPlayerIndex(matchCode, targetPlayerId),
        // });
        // this.combatService.initiateCombat(playerId, targetPlayerId, matchCode);
    }

    // canEndTurn(playerId: string, matchCode: string): boolean {
    //     const match = this.matchService.getMatch(matchCode);
    //     const playerIndex = match.matchData.players.findIndex((p) => p.id === playerId);
    //     const isActivePlayer = match.matchData.activePlayer === playerIndex;

    //     return isActivePlayer;
    // }

    // nextTurnPhase(matchCode: string) {
    //     const match = this.matchService.getMatch(matchCode);
    //     if (match.matchData.phase === TurnPhase.PreTurn) {
    //         match.matchData.phase = TurnPhase.Turn;
    //         this.startTurnTimer(match, TURN_DURATION);
    //         this.startTurn(match);
    //     } else if (match.matchData.phase === TurnPhase.Turn) {
    //         match.matchData.phase = TurnPhase.PreTurn;
    //         this.startTurnTimer(match, PRE_TURN_DURATION);
    //         this.startPreTurn(match);
    //     }
    // }

    // endOfCombat(matchCode: string, combatResult: CombatResult, playerId: string) {
    //     const match = this.matchService.getMatch(matchCode);
    //     if (match) {
    //         if (combatResult.winnerId) {
    //             this.respawnPlayer(combatResult.loserId, matchCode);
    //             const winnerPlayer = match.matchData.players.find((p) => p.id === combatResult.winnerId);
    //             winnerPlayer.currentStats.fightsWon += 1;
    //             if (winnerPlayer.currentStats.fightsWon >= MINIMUM_FIGHTS_TO_WIN) {
    //                 this.endMatch(matchCode);
    //                 return;
    //             }
    //         }
    //         this.playGateway.emitCombatResultBroadcast(matchCode, { match, combatResult });
    //         if (combatResult.loserId && this.canEndTurn(combatResult.loserId, matchCode)) {
    //             this.nextTurnPhase(matchCode);
    //         } else {
    //             this.tryEndTurn(matchCode, playerId);
    //             this.unfreezeMatch(match);
    //         }
    //     }
    // }

    // private unfreezeMatch(match: Match) {
    //     const turnData = this.matchService.getTurnData(match.matchData.code);
    //     if (turnData.phaseTimeout) {
    //         clearTimeout(turnData.phaseTimeout);
    //         turnData.phaseTimeout = null;
    //     }
    //     turnData.phaseTimeout = setTimeout(() => {
    //         this.nextTurnPhase(match.matchData.code);
    //     }, match.matchData.currentTimer);
    // }

    // private respawnPlayer(playerId: string, matchCode: string) {
    //     const match = this.matchService.getMatch(matchCode);
    //     if (match) {
    //         const player = this.matchService.getPlayer(match.matchData.code, playerId);
    //         if (player && player.isConnected) {
    //             if (player.spawnPoint !== player.currentStats.position) {
    //                 const position = this.movementService.getNearestEmptyTile(player.spawnPoint, match);
    //                 player.currentStats.position = position;
    //             }
    //         }
    //     }
    // }

    // private endMatch(matchCode: string) {
    //     const players = this.matchService.getPlayers(matchCode);
    //     this.playGateway.emitMatchEnded(matchCode, this.matchService.getMatch(matchCode));
    //     players.forEach((player) => {
    //         this.matchService.removePlayerFromMatch(player.id, matchCode, true);
    //         this.lobbyGateway.disconnectPlayer(player.id);
    //     });
    // }

    // private startPreTurn(match: Match) {
    //     this.depleteCurrentStats(match.matchData.players[match.matchData.activePlayer]);
    //     match.matchData.activePlayer = this.getNextCurrentIndex(match.matchData.players, match.matchData.activePlayer);
    //     this.playGateway.emitPreTurnStarted(match.matchData.code, match);
    // }

    // private startTurn(match: Match) {
    //     this.resetCurrentStats(match.matchData.players[match.matchData.activePlayer]);
    //     this.playGateway.emitTurnStarted(match.matchData.code, match);
    // }

    // private startTurnTimer(match: Match, duration: number) {
    //     const turnData = this.matchService.getTurnData(match.matchData.code);
    //     if (turnData.phaseTimeout) {
    //         clearTimeout(turnData.phaseTimeout);
    //         turnData.phaseTimeout = null;
    //     }
    //     turnData.lastPhaseStartTime = new Date();
    //     match.matchData.currentTimer = duration;
    //     match.matchData.maxTimer = duration;
    //     turnData.phaseTimeout = setTimeout(() => {
    //         this.nextTurnPhase(match.matchData.code);
    //     }, duration);
    // }

    // private resetCurrentStats(player: Player) {
    //     player.currentStats.hasAction = true;
    //     player.currentStats.health = player.playerStats.health;
    //     player.currentStats.movement = player.playerStats.speed;
    // }

    // private depleteCurrentStats(player: Player) {
    //     player.currentStats.hasAction = false;
    //     player.currentStats.movement = 0;
    //     player.currentStats.health = player.playerStats.health;
    // }

    // private reorganizeMatch(match: Match) {
    //     match.matchData.activePlayer = match.matchData.players.length - 1;
    //     match.matchData.isStarted = true;
    //     match.matchData.isLocked = true;
    //     this.sortPlayers(match);
    //     this.assignSpawnPoints(match);
    // }

    // private sortPlayers(match: Match) {
    //     match.matchData.players = match.matchData.players.sort((a: Player, b: Player) => {
    //         if (a.playerStats.speed !== b.playerStats.speed) {
    //             return b.playerStats.speed - a.playerStats.speed;
    //         }
    //         return Math.random() - HALF_POINT;
    //     });
    // }

    // private assignSpawnPoints(match: Match) {
    //     const spawnPoints = match.gameData.mapData.items.Spawn;
    //     const shuffledSpawnPoints = spawnPoints.sort(() => Math.random() - HALF_POINT).slice(0, match.matchData.players.length);
    //     match.gameData.mapData.items.Spawn = spawnPoints.filter((s) => shuffledSpawnPoints.includes(s));

    //     shuffledSpawnPoints.forEach((spawnPoint, i) => {
    //         match.matchData.players[i].spawnPoint = spawnPoint;
    //         match.matchData.players[i].currentStats.position = spawnPoint;
    //     });
    // }

    // private tryEndTurn(matchCode: string, playerId: string): boolean {
    //     const match = this.matchService.getMatch(matchCode);
    //     const activePlayerId = match.matchData.players[match.matchData.activePlayer].id;
    //     const player = this.matchService.getPlayer(matchCode, activePlayerId);

    //     const isCurrentTurn = activePlayerId === playerId;
    //     const canMove = this.movementService.getPossibleMoves(match).length > 0;
    //     const canAct = this.movementService.getActions(match).length > 1 && player.currentStats.hasAction;

    //     if (!canMove && !canAct && isCurrentTurn) {
    //         this.endTurn(activePlayerId);
    //         return true;
    //     }
    //     return false;
    // }
}
