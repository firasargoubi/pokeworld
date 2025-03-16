import { inject, Injectable } from '@angular/core';
import { MOVE_ANIMATION_DURATION } from '@app/consts/default-player.const';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CombatSocketService } from '@app/services/sockets/combat-socket/combat-socket.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { TimerService } from '@app/services/timer/timer.service';
import { CombatEvent } from '@common/combat-event.enum';
import { CombatBroadcastData, CombatData } from '@common/combat-interfaces';
import { LobbyEvent } from '@common/lobby-event.enum';
import { Match, PlayerMovementData } from '@common/match';
import { PlayEvent } from '@common/play-event.enum';
import { Position } from '@common/position';
import { ONE_SECOND } from './play-sockets.const';

@Injectable({
    providedIn: 'root',
})
export class PlaySocketsService {
    private coreSocket: CoreSocketService = inject(CoreSocketService);
    private matchDataService: MatchDataService = inject(MatchDataService);
    private timerService: TimerService = inject(TimerService);
    private mapService: MapService = inject(MapService);
    private popupService: PopupService = inject(PopupService);
    private combatSocketService: CombatSocketService = inject(CombatSocketService);

    constructor() {
        this.setupPlayListeners();
    }

    leaveMatch(): void {
        this.coreSocket.emit(LobbyEvent.LeaveMatch);
        this.matchDataService.resetMatch();
    }

    endTurn(): void {
        this.coreSocket.emit(PlayEvent.EndTurn);
    }

    clickTile(position: Position): void {
        const playerPosition = this.matchDataService.getPlayerPosition();
        const clickedItself = playerPosition.x === position.x && playerPosition.y === position.y;

        if (!clickedItself) {
            if (this.mapService.hasActionOverlay()) {
                this.coreSocket.emit(PlayEvent.Action, position);
            } else {
                this.coreSocket.emit(PlayEvent.Move, position);
            }
        }

        this.mapService.clearActions();
    }

    displayActions() {
        this.coreSocket.emit(PlayEvent.GetActions, null, (actions: Position[]) => {
            this.mapService.setActions(actions, this.matchDataService.getPlayerPosition());
        });
    }

    changeDebugMode(): void {
        this.coreSocket.emit(PlayEvent.ChangeDebugMode);
    }

    setHoverMoves(position: Position): void {
        this.coreSocket.emit(PlayEvent.GetHoverMoves, position, (hoverMoves: Position[]) => {
            this.mapService.setHoverMoves(hoverMoves);
        });
    }

    private setPossibleMoves(): void {
        this.coreSocket.emit(PlayEvent.GetPossibleMoves, null, (possibleMoves: Position[]) => {
            this.mapService.setPossibleMoves(possibleMoves, this.matchDataService.getPlayerPosition());
        });
    }

    private setupPlayListeners(): void {
        this.coreSocket.on(PlayEvent.PreTurnStarted, this.onPreTurnStarted.bind(this));
        this.coreSocket.on(PlayEvent.TurnStarted, this.onTurnStarted.bind(this));
        this.coreSocket.on(PlayEvent.PlayerMoved, this.onPlayerMoved.bind(this));
        this.coreSocket.on(PlayEvent.DebugModeChanged, this.onDebugModeChanged.bind(this));
        this.coreSocket.on(PlayEvent.BridgeChanged, this.onBridgeChanged.bind(this));
        this.coreSocket.on(LobbyEvent.PlayerLeft, this.onPlayerLeft.bind(this));
        this.coreSocket.on(CombatEvent.CombatStarted, this.onCombatStarted.bind(this));
        this.coreSocket.on(PlayEvent.CombatBroadcast, this.onCombatBroadcast.bind(this));
    }

    private onCombatBroadcast(combatBroadcastData: CombatBroadcastData) {
        this.matchDataService.updateMatch(combatBroadcastData.match);
        this.timerService.pauseTimer(combatBroadcastData.match.matchData.currentTimer / ONE_SECOND);
        if (![combatBroadcastData.playerOneIndex, combatBroadcastData.playerTwoIndex].includes(this.matchDataService.selfIndex)) {
            const player1 = this.matchDataService.matchData.players[combatBroadcastData.playerOneIndex].name;
            const player2 = this.matchDataService.matchData.players[combatBroadcastData.playerTwoIndex].name;
            this.popupService.showPopup(`${player1} et ${player2} entrent en combat!`);
        }
    }

    private onCombatStarted(combatData: CombatData) {
        this.combatSocketService.startCombat(combatData);
    }

    private onBridgeChanged(match: Match) {
        this.matchDataService.updateMatch(match);
        this.setActivePlayerPossibleMoves();
    }

    private onDebugModeChanged(match: Match) {
        this.matchDataService.updateMatch(match);
        if (match.matchData.isDebugMode) {
            this.popupService.showPopup('Mode de debug activé');
        } else {
            this.popupService.showPopup('Mode de debug désactivé');
        }
        this.setActivePlayerPossibleMoves();
    }

    private onPlayerMoved(playerMovementData: PlayerMovementData) {
        this.mapService.clearOverlays();
        this.matchDataService.updateMatch(playerMovementData.match);
        this.mapService.movePlayer(playerMovementData);
        if (this.matchDataService.isActivePlayer()) {
            setTimeout(this.setActivePlayerPossibleMoves.bind(this), MOVE_ANIMATION_DURATION * playerMovementData.movement.length);
        }
    }

    private onPreTurnStarted(match: Match) {
        this.matchDataService.updateMatch(match);
        const playerName = match.matchData.players[match.matchData.activePlayer].name;
        this.timerService.startTimer(match.matchData.maxTimer / ONE_SECOND);
        this.mapService.clearOverlays();
        this.popupService.showPopup(`Tour de ${playerName}`);
    }

    private onTurnStarted(match: Match) {
        this.matchDataService.updateMatch(match);
        this.popupService.clearMessages();
        this.timerService.startTimer(match.matchData.maxTimer / ONE_SECOND);
        this.setActivePlayerPossibleMoves();
    }

    private setActivePlayerPossibleMoves() {
        if (this.matchDataService.isActivePlayer()) {
            this.setPossibleMoves();
        }
    }

    private onPlayerLeft(match: Match) {
        const connectedPlayers = this.matchDataService.matchData.players.filter((p) => p.isConnected).map((p) => p.name);
        this.matchDataService.updateMatch(match);
        const disconnectedPlayers = this.matchDataService.matchData.players.filter((p) => !p.isConnected).map((p) => p.name);
        const disconnectedPlayer = connectedPlayers.find((p) => disconnectedPlayers.includes(p));
        this.popupService.showPopup(`${disconnectedPlayer} a quitté la partie`);
    }
}
