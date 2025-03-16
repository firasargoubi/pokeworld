import { inject, Injectable } from '@angular/core';
import { MOVE_ANIMATION_DURATION } from '@app/consts/default-player.const';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { TimerService } from '@app/services/timer/timer.service';
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

    move(position: Position): void {
        this.coreSocket.emit(PlayEvent.Move, position);
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
        this.coreSocket.on(LobbyEvent.PlayerLeft, this.onPlayerLeft.bind(this));
        this.coreSocket.on(PlayEvent.PlayerMoved, this.onPlayerMoved.bind(this));
    }

    private onPlayerMoved(playerMovementData: PlayerMovementData) {
        this.mapService.clearOverlays();
        this.matchDataService.updateMatch(playerMovementData.match);
        this.mapService.movePlayer(playerMovementData);
        if (this.matchDataService.isActivePlayer()) {
            if (this.matchDataService.matchData.isDebugMode) {
                this.setActivePlayerPossibleMoves.bind(this)
            } else {
                setTimeout(this.setActivePlayerPossibleMoves.bind(this), MOVE_ANIMATION_DURATION * playerMovementData.movement.length);
            }
        }
    }

    private onPreTurnStarted(match: Match) {
        this.matchDataService.updateMatch(match);
        const playerName = match.matchData.players[match.matchData.activePlayer].name;
        this.timerService.startTimer(match.matchData.maxTimer / ONE_SECOND);
        this.mapService.clearOverlays();
        this.popupService.showPopup(`Début du tour de ${playerName}`);
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
