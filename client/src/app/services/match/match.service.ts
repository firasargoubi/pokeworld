import { inject, Injectable } from '@angular/core';
import { NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { DEFAULT_GAME_DATA } from '@app/consts/game-data.const';
import { PopupMessage } from '@app/consts/popup-message.const';
import { ChatService } from '@app/services/chat/chat.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketService } from '@app/services/socket/socket.service';
import { DEFAULT_MATCH_DATA, DEFAULT_SELF_INDEX } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER_DATA, MAX_ITEMS } from '@common/consts/player-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { MatchData, MatchState } from '@common/interfaces/match-data';
import { MessageFromServer } from '@common/interfaces/message-from-server';
import { PlayerData } from '@common/interfaces/player-data';
import { MatchEvent } from '@common/interfaces/socket-event.enum';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchService {
    matchUpdate: Subject<MatchData> = new Subject();
    selfIndex: number = DEFAULT_SELF_INDEX;
    selfPlayer: PlayerData = structuredClone(DEFAULT_PLAYER_DATA);
    data: MatchData = structuredClone(DEFAULT_MATCH_DATA);
    private socketService: SocketService = inject(SocketService);
    private gameDataService: GameDataService = inject(GameDataService);
    private mapService: MapService = inject(MapService);
    private popupService: PopupService = inject(PopupService);
    private chatService: ChatService = inject(ChatService);
    private router: Router = inject(Router);

    constructor() {
        this.socketService.on(MatchEvent.Disconnect, this.onDisconnect.bind(this));
        this.socketService.on(MatchEvent.Update, this.onUpdate.bind(this));
        this.socketService.on(MatchEvent.Message, this.onMessage.bind(this));
        this.socketService.on(MatchEvent.RemovedFromMatch, this.onRemovedFromMatch.bind(this));
        this.router.events.subscribe(this.onNavigationUpdate.bind(this));
    }

    async createMatch(gameData: GameData): Promise<boolean> {
        return await this.socketService.emit(MatchEvent.CreateMatch, gameData, this.onMatchJoined.bind(this));
    }

    async joinMatch(matchCode: string): Promise<boolean> {
        return await this.socketService.emit(MatchEvent.JoinMatch, matchCode, this.onMatchJoined.bind(this));
    }

    leaveMatch() {
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

    isInventoryFull(): boolean {
        return this.selfPlayer.items.length > MAX_ITEMS;
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

    private onNavigationUpdate(event: RouterEvent) {
        window.console.log('AAA');
        if (event instanceof NavigationStart) {
            window.console.log('BBB');
            if (event.navigationTrigger !== 'imperative') {
                window.console.log('CCC');
                this.leaveMatch();
            }
        }
    }

    private onMatchJoined(matchData: MatchData) {
        this.onUpdate(matchData);
        this.router.navigate([PageEndpoint.Character]);
    }

    private onDisconnect() {
        if (this.isInMatch()) {
            this.popupService.keepMessages();
            this.popupService.showPopup({ message: PopupMessage.ConnectionError, hasCloseButton: true, isConfirmation: false });
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

    private onMessage(messageFromServer: MessageFromServer) {
        this.popupService.showPopup({
            message: messageFromServer.message,
            hasCloseButton: messageFromServer.hasCloseButton,
            isConfirmation: false,
        });
    }

    private onRemovedFromMatch(reason: string) {
        if (this.isInMatch()) {
            this.popupService.keepMessages();
            this.popupService.showPopup({ message: reason, hasCloseButton: true, isConfirmation: false });
            this.resetMatchData();
            this.router.navigate([PageEndpoint.Menu]);
        }
    }

    private resetMatchData() {
        this.selfIndex = DEFAULT_SELF_INDEX;
        this.data = structuredClone(DEFAULT_MATCH_DATA);
        this.selfPlayer = structuredClone(DEFAULT_PLAYER_DATA);
        this.gameDataService.setGameData(structuredClone(DEFAULT_GAME_DATA));
        this.mapService.setPlayers([]);
        this.mapService.clearOverlays();
        this.chatService.isChatActive.set(true);
        this.chatService.isFilterEnabled.set(false);
        this.matchUpdate.next(this.data);
    }
}
