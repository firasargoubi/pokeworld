import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_GAMES } from '@app/consts/tests/mock-games';
import { MOCK_MATCHES, MOCK_PLAYERS } from '@app/consts/tests/mock-matches';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { LobbyEvent } from '@common/lobby-event.enum';
import { Match } from '@common/match';
import { Player } from '@common/player';
import { Warning } from '@common/warning.enum';
import { LobbySocketsService } from './lobby-sockets.service';

describe('LobbySocketsService', () => {
    let service: LobbySocketsService;
    let coreSocketSpy: jasmine.SpyObj<CoreSocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let matchDataServiceSpy: jasmine.SpyObj<MatchDataService>;
    let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;

    const mockPlayer: Player = structuredClone(MOCK_PLAYERS[0]);

    const mockMatch: Match = structuredClone(MOCK_MATCHES[0]);

    beforeEach(() => {
        coreSocketSpy = jasmine.createSpyObj('CoreSocketService', ['emit', 'on'], { selfId: 'selfId' });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        matchDataServiceSpy = jasmine.createSpyObj('MatchDataService', ['startMatch']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup', 'keepMessages']);
        gameDataServiceSpy = jasmine.createSpyObj('GameDataService', ['gameData']);

        TestBed.configureTestingModule({
            providers: [
                { provide: CoreSocketService, useValue: coreSocketSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatchDataService, useValue: matchDataServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: GameDataService, useValue: gameDataServiceSpy },
            ],
        });

        service = TestBed.inject(LobbySocketsService);
        service['setupLobbyListeners']();
    });

    it('should set and get matchRoomCode', () => {
        const newCode = '5678';
        service.matchRoomCode = newCode;
        expect(service.matchRoomCode).toBe(newCode);
    });

    it('should expose players$ as an observable and emit updated players', (done) => {
        const expectedPlayers: Player[] = [mockPlayer];
        const expectedEmissions = [[], expectedPlayers];
        const receivedEmissions: Player[][] = [];

        const subscription = service.players$.subscribe((players) => {
            receivedEmissions.push(players);
            if (receivedEmissions.length === expectedEmissions.length) {
                expect(receivedEmissions).toEqual(expectedEmissions);
                subscription.unsubscribe();
                done();
            }
        });

        service['playersSubject'].next(expectedPlayers);
    });

    it('should expose roomLocked$ as an observable and emit updated lock status', (done) => {
        const expectedEmissions = [false, true];
        const receivedEmissions: boolean[] = [];

        const subscription = service.roomLocked$.subscribe((locked) => {
            receivedEmissions.push(locked);
            if (receivedEmissions.length === expectedEmissions.length) {
                expect(receivedEmissions).toEqual(expectedEmissions);
                subscription.unsubscribe();
                done();
            }
        });

        service['roomLockedSubject'].next(true);
    });

    it('should create match and resolve promise with success status', async () => {
        const matchCode = '1234';
        coreSocketSpy.emit.and.stub();

        const promise = service.createMatch(MOCK_GAMES[0]);
        const emitCall = coreSocketSpy.emit.calls.mostRecent();
        const callback = emitCall.args[2] as (matchCode: string) => void;
        callback(matchCode);

        const result = await promise;
        expect(result).toBe(true);
        expect(service.matchRoomCode).toBe(matchCode);
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.CreateMatch, MOCK_GAMES[0], jasmine.any(Function));
    });

    it('should resolve false when match creation fails', async () => {
        coreSocketSpy.emit.and.stub();

        const promise = service.createMatch(MOCK_GAMES[0]);
        const emitCall = coreSocketSpy.emit.calls.mostRecent();
        const callback = emitCall.args[2] as (matchCode: string) => void;
        callback('');

        const result = await promise;
        expect(result).toBe(false);
        expect(service.matchRoomCode).toBe('');
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.CreateMatch, MOCK_GAMES[0], jasmine.any(Function));
    });

    it('should emit KickPlayer event with playerId', () => {
        const playerId = 'P111';
        service.kickPlayer(playerId);
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.KickPlayer, playerId);
    });

    it('should join match and emit success via observable with 4-digit code', (done) => {
        const matchCode = '7890';
        coreSocketSpy.emit.and.stub();

        service.joinMatch(matchCode).subscribe((success) => {
            expect(success).toBe(true);
            expect(service.matchRoomCode).toBe(matchCode);
            expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.JoinMatch, matchCode, jasmine.any(Function));
            done();
        });

        const emitCall = coreSocketSpy.emit.calls.mostRecent();
        const callback = emitCall.args[2] as (success: boolean) => void;
        callback(true);
    });

    it('should emit LeaveMatch and navigate to /admin on leaveMatchAction', () => {
        service['leaveMatch']();
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.LeaveMatch);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should emit UpdatePlayer with player updates', () => {
        const playerUpdates: Partial<Player> = { name: 'UpdatedName' };
        service.updatePlayer(playerUpdates);
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.UpdatePlayer, playerUpdates);
    });

    it('should emit ChangeLockStatus with lock status', () => {
        const lockStatus = true;
        service.changeLockStatus(lockStatus);
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.ChangeLockStatus, lockStatus);
    });

    it('should emit StartMatch event', () => {
        service.startMatch();
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.StartMatch);
    });

    it('should update players on UpdatePlayerList event', () => {
        const players: Player[] = [mockPlayer];
        const updatePlayersCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === LobbyEvent.UpdatePlayerList);
        updatePlayersCall?.[1](players);
        expect(service['playersSubject'].value).toEqual(players);
    });

    it('should update room lock status on LockStatusChanged event', () => {
        const lockStatusCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === LobbyEvent.LockStatusChanged);
        lockStatusCall?.[1](true);
        expect(service['roomLockedSubject'].value).toBe(true);
    });

    it('should start match and navigate on MatchStarted event', () => {
        const matchStartedCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === LobbyEvent.MatchStarted);
        matchStartedCall?.[1](mockMatch);
        expect(matchDataServiceSpy.startMatch).toHaveBeenCalledWith(mockMatch, coreSocketSpy.selfId);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/play']);
    });

    it('should handle player removal from match', () => {
        const removalReason = Warning.RoomLocked;
        service['onRemovedFromMatch'](removalReason);
        expect(service.matchCode).toBe('');
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith(removalReason, true, jasmine.any(Function));
    });

    it('should handle player removal from match with other reasons', () => {
        const removalReason = Warning.Kick;
        service['onRemovedFromMatch'](removalReason);
        expect(service.matchCode).toBe('');
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith(removalReason);
        expect(popupServiceSpy.keepMessages).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should set gameData', () => {
        service['onEmitGameData'](MOCK_GAMES[0]);
        expect(gameDataServiceSpy.gameData).toEqual(MOCK_GAMES[0]);
    });

    it('should not show popup on Warning event if popup is displayed', () => {
        popupServiceSpy.isDisplayed = true;
        const warningCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === LobbyEvent.Warning);
        warningCall?.[1]('Warning message');
        expect(popupServiceSpy.showPopup).not.toHaveBeenCalled();
    });

    it('should show popup on Warning event if popup is not displayed', () => {
        popupServiceSpy.isDisplayed = false;
        const warningCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === LobbyEvent.Warning);
        warningCall?.[1]('Warning message');
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Warning message');
    });
});
