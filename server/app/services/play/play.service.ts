import { Match } from '@app/classes/match/match';
import { CombatService } from '@app/services/combat/combat.service';
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
    @Inject(CombatService) private readonly combatService: CombatService;

    endTurn(match: Match, playerId: string) {
        if (match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            this.startTurnStart(match);
        }
    }

    move(match: Match, playerId: string, position: Position) {
        if (match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const shortestPath = this.movementService.getShortestPath(match.data, position);
            if (shortestPath.moveCost <= match.data.playData.movementLeft) {
                match.getPlayer(playerId).position = position;
                match.data.playData.movementLeft -= shortestPath.moveCost;
                match.data.state = MatchState.MovementAnimation;
                this.setTimeLeft(match);
                match.sendUpdate();
                match.setTimeout(this.endOfMovementAnimation.bind(this, match), (shortestPath.path.length + 1) * MOVEMENT_ANIMATION_DURATION);
            }
        }
    }

    action(match: Match, playerId: string, position: Position) {
        if (match.data.playData.hasAction && match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const actions = this.movementService.getActions(match.data);
            if (actions.some((a) => a.x === position.x && a.y === position.y)) {
                match.data.playData.hasAction = false;
                this.executeAction(match, playerId, position);
            }
        }
    }

    debugMove(match: Match, playerId: string, position: Position) {
        if (match.data.playData.isDebugMode && match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
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
        const playerName = match.data.players[match.data.playData.activePlayerIndex].name;
        match.sendMessage(`Début du tour de ${playerName}`);
        match.setTimeout(this.startTurnWait.bind(this, match), TURN_START_DURATION);
    }

    endOfCombat(match: Match) {
        match.data.state = MatchState.TurnWait;
        // TODO check for win condition
        match.sendUpdate();
        match.setTimeout(this.startTurnStart.bind(this, match), match.data.playData.timeLeft);
    }

    private setTimeLeft(match: Match) {
        const elapsedTime = Math.abs(new Date().getTime() - match.lastTimeoutStart.getTime());
        match.data.playData.timeLeft = match.data.playData.timeLeft - elapsedTime;
    }

    private endOfMovementAnimation(match: Match) {
        match.data.state = MatchState.TurnWait;
        match.sendUpdate();
        match.setTimeout(this.startTurnStart.bind(this, match), match.data.playData.timeLeft);
    }

    private startTurnWait(match: Match) {
        match.data.state = MatchState.TurnWait;
        match.data.playData.hasAction = true;
        match.data.playData.movementLeft = match.data.players[match.data.playData.activePlayerIndex].speed;
        match.sendUpdate();
        match.setTimeout(this.startTurnStart.bind(this, match), TURN_WAIT_DURATION);
    }

    private executeAction(match: Match, playerId: string, position: Position) {
        const targetPlayer = match.data.players.find((p) => p.position.x === position.x && p.position.y === position.y);
        if (targetPlayer) {
            this.setTimeLeft(match);
            this.combatService.startCombat(match, playerId, targetPlayer.id);
        } else {
            this.toggleBridgeTile(match, position);
        }
    }

    private toggleBridgeTile(match: Match, position: Position) {
        const tile = match.data.gameData.mapData.tiles[position.x][position.y];
        if (tile === TileType.Bridge) {
            match.data.gameData.mapData.tiles[position.x][position.y] = TileType.BrokenBridge;
        } else if (tile === TileType.BrokenBridge) {
            match.data.gameData.mapData.tiles[position.x][position.y] = TileType.Bridge;
        }
        match.sendUpdate();
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
}
