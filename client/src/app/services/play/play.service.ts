import { inject, Injectable } from '@angular/core';
import { MapService } from '@app/services/map/map.service';
import { Position } from '@common/interfaces/position';
import { SocketService } from '@app/services/socket/socket.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayEvent } from '@common/interfaces/socket-event.enum';

@Injectable({
    providedIn: 'root',
})
export class PlayService {
    private socketService: SocketService = inject(SocketService);
    private matchService: MatchService = inject(MatchService);
    private mapService: MapService = inject(MapService);

    endTurn(): void {
        this.socketService.emit(PlayEvent.EndTurn);
    }

    rightClickTile(position: Position) {
        if (this.matchService.data.playData.isDebugMode && this.matchService.isActivePlayer()) {
            this.socketService.emit(PlayEvent.DebugMove, position);
        }
    }

    clickTile(position: Position): void {
        const selfPosition = this.matchService.selfPlayer.position;
        const clickedItself = selfPosition.x === position.x && selfPosition.y === position.y;

        if (!clickedItself) {
            if (this.mapService.hasActionOverlay()) {
                this.socketService.emit(PlayEvent.Action, position);
            } else {
                this.socketService.emit(PlayEvent.Move, position);
            }
        }

        this.mapService.clearActions();
    }

    displayActions() {
        // TODO show actions
        // this.mapService.setActions(actions, this.matchService.selfPlayer.position);
    }

    // eslint-disable-next-line no-unused-vars
    displayMovementPath(targetPositon: Position) {
        // TODO show movement path
    }

    changeDebugMode(): void {
        this.socketService.emit(PlayEvent.ChangeDebugMode, !this.matchService.data.playData.isDebugMode);
    }
}
