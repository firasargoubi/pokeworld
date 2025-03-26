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
import { MatchData } from '@common/interfaces/match-data';
import { PlayerData } from '@common/interfaces/player-data';
import { MatchEvent } from '@common/interfaces/socket-event.enum';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchService {
    matchUpdate: Subject<void> = new Subject();
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
        this.socketService.emit(MatchEvent.CreateMatch, gameData, (matchData: MatchData | null) => {
            if (matchData !== null) {
                this.onUpdate(matchData);
                this.router.navigate([PageEndpoint.character]);
            }
        });
    }

    joinMatch(matchCode: string) {
        this.socketService.emit(MatchEvent.JoinMatch, matchCode, (matchData: MatchData | null) => {
            if (matchData !== null) {
                this.onUpdate(matchData);
                this.router.navigate([PageEndpoint.character]);
            }
        });
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

    isHost(): boolean {
        return this.selfIndex === this.data.lobbyData.hostPlayerIndex;
    }

    isInMatch(): boolean {
        return this.selfIndex >= 0;
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
        this.data = matchData;
        this.selfIndex = matchData.players.findIndex((p) => p.id === this.socketService.selfId);
        this.selfPlayer = matchData.players[this.selfIndex];
        this.gameDataService.setGameData(matchData.gameData);
        this.mapService.setPlayers(matchData.players);
        this.matchUpdate.next();
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
        this.matchUpdate.next();
    }
}
