import { inject, Injectable } from '@angular/core';
import { NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { DEFAULT_GAME_DATA } from '@app/consts/game-data.const';
import { PopupMessage } from '@app/consts/popup-message.const';
import { ChatTab } from '@app/interfaces/chat-tab.enum';
import { PopupColor } from '@app/interfaces/popup';
import { ChatService } from '@app/services/chat/chat.service';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { MapService } from '@app/services/map/map.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { DEFAULT_MATCH_DATA, DEFAULT_SELF_INDEX } from '@common/consts/match-data.const';
import { DEFAULT_PLAYER_DATA, MAX_ITEMS } from '@common/consts/player-data.const';
import { WARNING_MESSAGES } from '@common/consts/warning-messages';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameData } from '@common/interfaces/game-data';
import { MatchData, MatchSettings, MatchState } from '@common/interfaces/match-data';
import { MessageFromServer } from '@common/interfaces/message-from-server';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, PlayerData } from '@common/interfaces/player-data';
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
    private chatService: ChatService = inject(ChatService);
    private gameDataService: GameDataService = inject(GameDataService);
    private mapService: MapService = inject(MapService);
    private popupService: PopupService = inject(PopupService);
    private i18nService: I18nService = inject(I18nService);
    private userService: UserService = inject(UserService);
    private router: Router = inject(Router);

    constructor() {
        this.socketService.on(MatchEvent.Disconnect, this.onDisconnect.bind(this));
        this.socketService.on(MatchEvent.Update, this.onUpdate.bind(this));
        this.socketService.on(MatchEvent.Message, this.onMessage.bind(this));
        this.socketService.on(MatchEvent.RemovedFromMatch, this.onRemovedFromMatch.bind(this));
        this.router.events.subscribe(this.onNavigationUpdate.bind(this));
    }

    async createMatch(gameData: GameData, matchSettings: MatchSettings): Promise<boolean> {
        const matchCreated = await this.socketService.emit(MatchEvent.CreateMatch, { gameData, matchSettings }, this.onMatchJoined.bind(this));
        if (matchCreated) {
            this.chatService.createChannel(this.data.code, true);
            this.chatService.setActiveMatchCode(this.data.code);
        }
        return matchCreated;
    }

    async joinMatch(matchCode: string, confirmJoinBlockedUser: boolean = false): Promise<boolean> {
        const payload = { matchCode, confirmJoinBlockedUser };
        const matchJoined = await this.socketService.emit(MatchEvent.JoinMatch, payload, this.onMatchJoined.bind(this));
        if (matchJoined) {
            this.chatService.joinChannel(matchCode);
            this.chatService.setActiveMatchCode(matchCode);
        }

        return matchJoined;
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
        return this.isActivePlayer() && this.isState([MatchState.TurnWait]) && this.data.playData.actionsLeft > 0;
    }

    canEndTurn(): boolean {
        return this.isActivePlayer() && this.isState([MatchState.TurnWait]);
    }

    getMovementLeft(): number {
        return this.isActivePlayer() ? this.data.playData.movementLeft : 0;
    }

    isSelfPlayer(player: PlayerData | null): boolean {
        if (!player) {
            return false;
        }

        const currentUserId = this.userService.currentUser?.userId;
        const socketId = this.socketService.selfId;

        return [currentUserId, socketId].some((candidateId) => !!candidateId && (player.id === candidateId || player.userId === candidateId));
    }

    getLockedAvatars(): Avatar[] {
        const lockedAvatars: Avatar[] = [];
        this.data.players.forEach((player) => {
            if (player.avatar && player.avatar !== this.selfPlayer.avatar) {
                const playerAvatar: Avatar = player.avatar;
                const basePlayerAvatar: Avatar = (playerAvatar.match(/^avatar\d+/)?.[0] as Avatar) || playerAvatar;
                lockedAvatars.push(basePlayerAvatar);
            }
        });
        return lockedAvatars;
    }

    private onNavigationUpdate(event: RouterEvent) {
        if (event instanceof NavigationStart && event.navigationTrigger !== 'imperative') {
            this.leaveMatch();
        }
    }

    private onMatchJoined(matchData: MatchData | null) {
        if (!matchData) {
            return;
        }
        this.onUpdate(matchData);
        this.router.navigate([PageEndpoint.Character]);
    }

    private onDisconnect() {
        if (this.isInMatch()) {
            this.popupService.keepMessages();
            this.popupService.showPopup({ message: PopupMessage.ConnectionError, hasCloseButton: false, isConfirmation: false });
            this.resetMatchData();
            this.router.navigate([PageEndpoint.Menu]);
        }
    }

    private onUpdate(matchData: MatchData) {
        const oldMatchData = this.data;
        this.data = matchData;
        this.selfIndex = matchData.players.findIndex((player) => this.isSelfPlayer(player));
        this.selfPlayer = this.selfIndex >= 0 ? matchData.players[this.selfIndex] : structuredClone(DEFAULT_PLAYER_DATA);
        this.gameDataService.setGameData(matchData.gameData);
        this.matchUpdate.next(oldMatchData);
    }

    private onMessage(messageFromServer: MessageFromServer) {
        if (this.router.url === PageEndpoint.Character) return;
        const messageParams = { ...messageFromServer.messageParams };
        if (messageFromServer.message === Message.TeamWin && typeof messageParams.team === 'string') {
            messageParams.team = this.i18nService.translate(messageParams.team);
        }
        const translatedMessage = this.i18nService.translate(messageFromServer.message, messageParams);

        if (messageFromServer.message === Message.BlockedPlayerInLobby) {
            this.popupService.showPopup({
                message: translatedMessage,
                hasCloseButton: true,
                isConfirmation: true,
                popupColor: PopupColor.Orange,
                action: () => {
                    const requestedMatchCode = messageFromServer.messageParams?.matchCode as string;
                    if (requestedMatchCode) {
                        this.joinMatch(requestedMatchCode, true);
                    }
                },
            });
            return;
        }

        this.popupService.showPopup({
            message: translatedMessage,
            hasCloseButton: messageFromServer.hasCloseButton,
            isConfirmation: false,
            popupColor: WARNING_MESSAGES.includes(messageFromServer.message) ? PopupColor.Orange : PopupColor.Blue,
        });
    }

    private onRemovedFromMatch(reason: string) {
        if (this.isInMatch()) {
            const translatedReason = this.i18nService.translate(reason);
            this.popupService.keepMessages();
            if (reason === Message.LockedFromLobby) {
                this.router.navigate([PageEndpoint.Join]);
                this.popupService.showPopup({
                    message: translatedReason,
                    hasCloseButton: true,
                    isConfirmation: true,
                    action: () => {
                        this.router.navigate([PageEndpoint.Menu]);
                    },
                });
            } else {
                this.router.navigate([PageEndpoint.Menu]);
                this.popupService.showPopup({ message: translatedReason, hasCloseButton: false, isConfirmation: false });
            }
            this.resetMatchData();
        }
    }

    private resetMatchData() {
        this.selfIndex = DEFAULT_SELF_INDEX;
        this.data = structuredClone(DEFAULT_MATCH_DATA);
        this.selfPlayer = structuredClone(DEFAULT_PLAYER_DATA);
        this.gameDataService.setGameData(structuredClone(DEFAULT_GAME_DATA));
        this.mapService.setPlayers([]);
        this.mapService.clearOverlays();
        this.chatService.switchTab(ChatTab.Channels);
        this.chatService.isFilterEnabled.set(false);
        this.chatService.leaveChannel(this.data.code);
        this.chatService.setActiveMatchCode(undefined);
        this.matchUpdate.next(this.data);
    }
}
