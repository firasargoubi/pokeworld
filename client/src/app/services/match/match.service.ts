import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_GAME_DATA } from '@app/consts/game-data.const';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketService } from '@app/services/socket/socket.service';
import { DEFAULT_MATCH_DATA } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER_DATA } from '@common/consts/player-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { PlayerData } from '@common/interfaces/player-data';
import { MatchEvent } from '@common/interfaces/socket-event.enum';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchService {
    matchUpdate: Subject<MatchData> = new Subject();
    selfIndex: number = -1;
    selfPlayer: PlayerData = structuredClone(DEFAULT_PLAYER_DATA);
    data: MatchData = structuredClone(DEFAULT_MATCH_DATA);
    private socketService: SocketService = inject(SocketService);
    private gameDataService: GameDataService = inject(GameDataService);
    private mapService: MapService = inject(MapService);
    private popupService: PopupService = inject(PopupService);
    private router: Router = inject(Router);

    constructor() {
        this.socketService.on(MatchEvent.Disconnect, this.onDisconnect.bind(this));
        this.socketService.on(MatchEvent.Update, this.onUpdate.bind(this));
        this.socketService.on(MatchEvent.Message, this.onMessage.bind(this));
        this.socketService.on(MatchEvent.RemovedFromMatch, this.onRemovedFromMatch.bind(this));
    }

    createMatch(gameData: GameData) {
        this.socketService.emit(MatchEvent.CreateMatch, gameData, this.onMatchJoined.bind(this));
    }

    joinMatch(matchCode: string) {
        this.socketService.emit(MatchEvent.JoinMatch, matchCode, this.onMatchJoined.bind(this));
    }

    leaveMatch(): void {
        if (this.isInMatch()) {
            this.socketService.emit(MatchEvent.LeaveMatch);
            this.resetMatchData();
        }
        this.router.navigate([PageEndpoint.Menu]);
    }

    isActivePlayer(): boolean {
        return this.selfIndex === this.data.playData.activePlayerIndex;
    }

    canUseDebugMove(): boolean {
        return this.data.playData.isDebugMode && this.isActivePlayer();
    }

    isHost(): boolean {
        return this.selfIndex === this.data.lobbyData.hostPlayerIndex;
    }

    isInMatch(): boolean {
        return this.selfIndex >= 0;
    }

    isState(states: MatchState[]): boolean {
        return states.includes(this.data.state);
    }

    canUseAction(): boolean {
        return this.isActivePlayer() && this.isState([MatchState.TurnWait]) && this.data.playData.hasAction;
    }

    canEndTurn(): boolean {
        return this.isActivePlayer() && this.isState([MatchState.TurnWait]);
    }

    getMovementLeft(): number {
        return this.isActivePlayer() ? this.data.playData.movementLeft : 0;
    }

    private onMatchJoined(matchData: MatchData | null) {
        if (matchData !== null) {
            this.onUpdate(matchData);
            this.router.navigate([PageEndpoint.Character]);
        }
    }

    private onDisconnect() {
        if (this.isInMatch()) {
            this.popupService.keepMessages();
            this.popupService.showPopup('La connexion avec le serveur a été interrompu');
            this.resetMatchData();
            this.router.navigate([PageEndpoint.Menu]);
        }
    }

    private onUpdate(matchData: MatchData) {
        const oldMatchData = this.data;
        this.data = matchData;
        this.selfIndex = matchData.players.findIndex((p) => p.id === this.socketService.selfId);
        this.selfPlayer = matchData.players[this.selfIndex];
        this.gameDataService.setGameData(matchData.gameData);
        this.matchUpdate.next(oldMatchData);
    }

    private onMessage(message: string) {
        this.popupService.showPopup(message);
    }

    private onRemovedFromMatch(reason: string) {
        if (this.isInMatch()) {
            this.popupService.keepMessages();
            this.popupService.showPopup(reason);
            this.resetMatchData();
            this.router.navigate([PageEndpoint.Menu]);
        }
    }

    private resetMatchData() {
        this.data = structuredClone(DEFAULT_MATCH_DATA);
        this.selfIndex = -1;
        this.selfPlayer = structuredClone(DEFAULT_PLAYER_DATA);
        this.gameDataService.setGameData(structuredClone(DEFAULT_GAME_DATA));
        this.mapService.setPlayers([]);
        this.mapService.clearOverlays();
        this.matchUpdate.next(this.data);
    }
}
