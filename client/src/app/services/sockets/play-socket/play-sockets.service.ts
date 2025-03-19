import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CombatSocketService } from '@app/services/sockets/combat-socket/combat-socket.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { TimerService } from '@app/services/timer/timer.service';
import { MOVE_ANIMATION_DURATION } from '@common/consts/player.const';
import { CombatData, CombatDataBroadcast, CombatResultBroadcast } from '@common/interfaces/combat';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { Match, PlayerLeftData, PlayerMovementData } from '@common/interfaces/match';
import { Player } from '@common/interfaces/player';
import { Position } from '@common/interfaces/position';
import { CombatEvent, LobbyEvent, PlayEvent } from '@common/interfaces/websocket-event.enum';
import { END_GAME_DELAY, TIME_SCALE } from './play-sockets.const';

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
    private lobbySocketsService: LobbySocketsService = inject(LobbySocketsService);
    private router: Router = inject(Router);

    constructor() {
        this.setupPlayListeners();
    }

    rightClickTile(position: Position) {
        if (this.matchDataService.matchData.isDebugMode && this.matchDataService.isActivePlayer()) {
            this.coreSocket.emit(PlayEvent.DebugMove, position);
        }
    }

    leaveMatch(): void {
        this.lobbySocketsService.leaveMatch();
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
        this.coreSocket.on(PlayEvent.CombatDataBroadcast, this.onCombatDataBroadcast.bind(this));
        this.coreSocket.on(PlayEvent.CombatResultBroadcast, this.onCombatResultBroadcast.bind(this));
        this.coreSocket.on(PlayEvent.MatchEnded, this.onMatchEnded.bind(this));
    }

    private onMatchEnded(match: Match) {
        this.matchDataService.updateMatch(match);
        this.mapService.clearOverlays();
        const winningPlayerName = this.matchDataService.matchData.players.reduce((p1, p2) =>
            p2.currentStats.fightsWon > p1.currentStats.fightsWon ? p2 : p1,
        ).name;
        this.popupService.showPopup(`${winningPlayerName} a remporté la partie`);
        setTimeout(() => {
            this.router.navigate([PageEndpoint.Menu]);
        }, END_GAME_DELAY);
    }

    private onCombatResultBroadcast(combatResultBroadcast: CombatResultBroadcast) {
        this.matchDataService.updateMatch(combatResultBroadcast.match);
        this.mapService.setPlayers(combatResultBroadcast.match.matchData.players);
        this.setActivePlayerPossibleMoves();
        this.mapService.updateAllTiles();

        if (combatResultBroadcast.combatResult.winnerId) {
            const player = (combatResultBroadcast.match.matchData.players.find((p) => p.id === combatResultBroadcast.combatResult.winnerId) as Player)
                .name;
            this.popupService.showPopup(`${player} a gagné le combat`);
        } else {
            this.popupService.showPopup("Personne n'a gagné le combat");
        }
        this.timerService.unPauseTimer();
    }

    private onCombatDataBroadcast(combatDataBroadcast: CombatDataBroadcast) {
        this.matchDataService.updateMatch(combatDataBroadcast.match);
        this.timerService.pauseTimer(combatDataBroadcast.match.matchData.currentTimer / TIME_SCALE);
        if (![combatDataBroadcast.playerOneIndex, combatDataBroadcast.playerTwoIndex].includes(this.matchDataService.selfIndex)) {
            const player1 = this.matchDataService.matchData.players[combatDataBroadcast.playerOneIndex].name;
            const player2 = this.matchDataService.matchData.players[combatDataBroadcast.playerTwoIndex].name;
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
        this.popupService.removeMessagesByFilter((message) => message.toLowerCase().includes('debug'));
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
        this.timerService.startTimer(match.matchData.maxTimer / TIME_SCALE);
        this.mapService.clearOverlays();
        this.popupService.showPopup(`Tour de ${playerName}`);
    }

    private onTurnStarted(match: Match) {
        this.matchDataService.updateMatch(match);
        this.popupService.clearMessages();
        this.timerService.startTimer(match.matchData.maxTimer / TIME_SCALE);
        this.setActivePlayerPossibleMoves();
    }

    private setActivePlayerPossibleMoves() {
        if (this.matchDataService.isActivePlayer()) {
            this.setPossibleMoves();
        }
    }

    private onPlayerLeft(playerLeftData: PlayerLeftData) {
        this.matchDataService.updateMatch(playerLeftData.match);
        this.mapService.setPlayers(playerLeftData.match.matchData.players);
        this.popupService.showPopup(`${playerLeftData.playerName} a quitté la partie`);
        this.setActivePlayerPossibleMoves();
    }
}
