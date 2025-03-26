import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CombatSocketService } from '@app/services/sockets/combat-socket/combat-socket.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { TimerService } from '@app/services/timer/timer.service';
import { MOVE_ANIMATION_DURATION } from '@common/consts/player.const';
import { CombatData, CombatDataBroadcast, CombatResultBroadcast } from '@common/interfaces/combat';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { Match, PlayerMovementData } from '@common/interfaces/match';
import { Player } from '@common/interfaces/player';
import { Position } from '@common/interfaces/position';
import { CombatEvent, LobbyEvent, PlayEvent } from '@common/interfaces/socket-event.enum';
import { MOCK_MATCHES, MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MOCK_PLAYERS, PLAYER_IDS } from '@common/test-consts/mock-players';
import { END_GAME_DELAY, TIME_SCALE } from './play-sockets.const';
import { PlaySocketsService } from './play-sockets.service';

describe('PlaySocketsService', () => {
    let service: PlaySocketsService;
    let coreSocketSpy: jasmine.SpyObj<CoreSocketService>;
    let matchDataServiceSpy: jasmine.SpyObj<MatchDataService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let mapServiceSpy: jasmine.SpyObj<MapService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let combatSocketServiceSpy: jasmine.SpyObj<CombatSocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    const mockMatch = structuredClone(MOCK_MATCHES[0]);

    beforeEach(() => {
        coreSocketSpy = jasmine.createSpyObj('CoreSocketService', ['emit', 'on']);
        matchDataServiceSpy = jasmine.createSpyObj('MatchDataService', ['updateMatch', 'getPlayerPosition', 'isActivePlayer', 'resetMatch']);
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['startTimer', 'pauseTimer', 'unPauseTimer']);
        mapServiceSpy = jasmine.createSpyObj('MapService', [
            'setHoverMoves',
            'setPossibleMoves',
            'setActions',
            'clearOverlays',
            'movePlayer',
            'hasActionOverlay',
            'clearActions',
            'setPlayers',
            'updateAllTiles',
        ]);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup', 'clearMessages', 'removeMessagesByFilter']);
        combatSocketServiceSpy = jasmine.createSpyObj('CombatSocketService', ['startCombat']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: CoreSocketService, useValue: coreSocketSpy },
                { provide: MatchDataService, useValue: matchDataServiceSpy },
                { provide: TimerService, useValue: timerServiceSpy },
                { provide: MapService, useValue: mapServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: CombatSocketService, useValue: combatSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });

        service = TestBed.inject(PlaySocketsService);
        service['setupPlayListeners']();
    });

    it('should created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit LeaveMatch and reset match data', () => {
        service.leaveMatch();
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(LobbyEvent.LeaveMatch);
        expect(matchDataServiceSpy.resetMatch).toHaveBeenCalled();
    });

    it('should emit DebugMove event', () => {
        const position = { x: 2, y: 3 };
        matchDataServiceSpy.matchData = { ...mockMatch.matchData, isDebugMode: true };
        matchDataServiceSpy.isActivePlayer.and.returnValue(true);
        service.rightClickTile(position);
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(PlayEvent.DebugMove, position);
    });

    it('should emit EndTurn event', () => {
        service.endTurn();
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(PlayEvent.EndTurn);
    });

    it('should handle clickTile based on position and overlay', () => {
        const playerPos = { x: 1, y: 1 };
        const otherPos = { x: 2, y: 2 };
        matchDataServiceSpy.getPlayerPosition.and.returnValue(playerPos);

        service.clickTile(playerPos);
        expect(coreSocketSpy.emit).not.toHaveBeenCalled();
        expect(mapServiceSpy.clearActions).toHaveBeenCalledTimes(1);

        mapServiceSpy.hasActionOverlay.and.returnValue(true);
        service.clickTile(otherPos);
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(PlayEvent.Action, otherPos);
        expect(mapServiceSpy.clearActions).toHaveBeenCalledTimes(2);

        mapServiceSpy.hasActionOverlay.and.returnValue(false);
        service.clickTile(otherPos);
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(PlayEvent.Move, otherPos);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- expected calls
        expect(mapServiceSpy.clearActions).toHaveBeenCalledTimes(3);
    });

    it('should emit GetActions and set actions on callback', () => {
        const mockActions: Position[] = [{ x: 3, y: 3 }];
        const playerPos = { x: 1, y: 1 };
        matchDataServiceSpy.getPlayerPosition.and.returnValue(playerPos);

        service.displayActions();
        const emitCall = coreSocketSpy.emit.calls.mostRecent();
        expect(emitCall.args[0]).toBe(PlayEvent.GetActions);
        expect(emitCall.args[1]).toBeNull();

        const callback = emitCall.args[2] as (actions: Position[]) => void;
        callback(mockActions);
        expect(mapServiceSpy.setActions).toHaveBeenCalledWith(mockActions, playerPos);
    });

    it('should emit ChangeDebugMode event', () => {
        service.changeDebugMode();
        expect(coreSocketSpy.emit).toHaveBeenCalledWith(PlayEvent.ChangeDebugMode);
    });

    it('should emit GetHoverMoves and set hover moves on callback', () => {
        const mockPosition: Position = { x: 2, y: 2 };
        const mockHoverMoves: Position[] = [
            { x: 3, y: 3 },
            { x: 4, y: 4 },
        ];

        service.setHoverMoves(mockPosition);
        const emitCall = coreSocketSpy.emit.calls.mostRecent();
        expect(emitCall.args[0]).toBe(PlayEvent.GetHoverMoves);
        expect(emitCall.args[1]).toEqual(mockPosition);

        const callback = emitCall.args[2] as (hoverMoves: Position[]) => void;
        callback(mockHoverMoves);
        expect(mapServiceSpy.setHoverMoves).toHaveBeenCalledWith(mockHoverMoves);
    });

    it('should emit GetPossibleMoves and set possible moves on callback', () => {
        const mockPossibleMoves: Position[] = [
            { x: 5, y: 5 },
            { x: 6, y: 6 },
        ];
        const playerPos = { x: 1, y: 1 };
        matchDataServiceSpy.getPlayerPosition.and.returnValue(playerPos);

        service['setPossibleMoves']();
        const emitCall = coreSocketSpy.emit.calls.mostRecent();
        expect(emitCall.args[0]).toBe(PlayEvent.GetPossibleMoves);
        expect(emitCall.args[1]).toBeNull();

        const callback = emitCall.args[2] as (possibleMoves: Position[]) => void;
        callback(mockPossibleMoves);
        expect(mapServiceSpy.setPossibleMoves).toHaveBeenCalledWith(mockPossibleMoves, playerPos);
    });

    it('should handle CombatStarted event and start combat', () => {
        const combatData: CombatData = {
            combatRoomCode: 'ROOM123',
            players: MOCK_PLAYERS,
        };
        const eventCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === CombatEvent.CombatStarted);

        eventCall?.[1](combatData);
        expect(combatSocketServiceSpy.startCombat).toHaveBeenCalledWith(combatData);
    });

    it('should handle BridgeChanged event and update match with possible moves', () => {
        const updatedMatch = { ...mockMatch, matchData: { ...mockMatch.matchData, activePlayer: 0 } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'setActivePlayerPossibleMoves');

        const eventCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === PlayEvent.BridgeChanged);
        eventCall?.[1](updatedMatch);

        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(updatedMatch);
        expect(service['setActivePlayerPossibleMoves']).toHaveBeenCalled();
    });

    it('should handle DebugModeChanged event and update with debug mode status', () => {
        const debugOnMatch = { ...mockMatch, matchData: { ...mockMatch.matchData, isDebugMode: true } };
        const debugOffMatch = { ...mockMatch, matchData: { ...mockMatch.matchData, isDebugMode: false } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'setActivePlayerPossibleMoves');

        const eventCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === PlayEvent.DebugModeChanged);

        eventCall?.[1](debugOnMatch);
        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(debugOnMatch);
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Mode de debug activé');
        expect(service['setActivePlayerPossibleMoves']).toHaveBeenCalled();

        eventCall?.[1](debugOffMatch);
        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(debugOffMatch);
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Mode de debug désactivé');
        expect(service['setActivePlayerPossibleMoves']).toHaveBeenCalledTimes(2);
    });

    it('should handle PlayerMoved event and update moves if active player', () => {
        jasmine.clock().install();
        const playerMovementData: PlayerMovementData = {
            playerIndex: 0,
            movement: [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
            match: mockMatch,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'setActivePlayerPossibleMoves');

        const eventCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === PlayEvent.PlayerMoved);

        matchDataServiceSpy.isActivePlayer.and.returnValue(true);
        eventCall?.[1](playerMovementData);
        expect(mapServiceSpy.clearOverlays).toHaveBeenCalled();
        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(mockMatch);
        expect(mapServiceSpy.movePlayer).toHaveBeenCalledWith(playerMovementData);

        jasmine.clock().tick(MOVE_ANIMATION_DURATION * playerMovementData.movement.length);
        expect(service['setActivePlayerPossibleMoves']).toHaveBeenCalled();

        matchDataServiceSpy.isActivePlayer.and.returnValue(false);
        eventCall?.[1](playerMovementData);
        expect(mapServiceSpy.clearOverlays).toHaveBeenCalledTimes(2);
        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledTimes(2);
        expect(mapServiceSpy.movePlayer).toHaveBeenCalledTimes(2);
        expect(service['setActivePlayerPossibleMoves']).toHaveBeenCalledTimes(1);

        jasmine.clock().uninstall();
    });

    it('should handle PreTurnStarted event and start turn setup', () => {
        const updatedMatch = { ...mockMatch, matchData: { ...mockMatch.matchData, activePlayer: 1, maxTimer: 30000 } };
        const playerName = updatedMatch.matchData.players[1].name;

        const eventCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === PlayEvent.PreTurnStarted);
        eventCall?.[1](updatedMatch);

        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(updatedMatch);
        expect(timerServiceSpy.startTimer).toHaveBeenCalledWith(updatedMatch.matchData.maxTimer / TIME_SCALE);
        expect(mapServiceSpy.clearOverlays).toHaveBeenCalled();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith(`Tour de ${playerName}`);
    });

    it('should handle TurnStarted event and start turn', () => {
        const updatedMatch = { ...mockMatch, matchData: { ...mockMatch.matchData, maxTimer: 30000 } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'setActivePlayerPossibleMoves');

        const eventCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === PlayEvent.TurnStarted);
        eventCall?.[1](updatedMatch);

        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(updatedMatch);
        expect(popupServiceSpy.clearMessages).toHaveBeenCalled();
        expect(timerServiceSpy.startTimer).toHaveBeenCalledWith(updatedMatch.matchData.maxTimer / TIME_SCALE);
        expect(service['setActivePlayerPossibleMoves']).toHaveBeenCalled();
    });

    it('should call setPossibleMoves if player is active', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'setPossibleMoves');

        matchDataServiceSpy.isActivePlayer.and.returnValue(true);
        service['setActivePlayerPossibleMoves']();
        expect(matchDataServiceSpy.isActivePlayer).toHaveBeenCalled();
        expect(service['setPossibleMoves']).toHaveBeenCalled();

        matchDataServiceSpy.isActivePlayer.and.returnValue(false);
        service['setActivePlayerPossibleMoves']();
        expect(matchDataServiceSpy.isActivePlayer).toHaveBeenCalledTimes(2);
        expect(service['setPossibleMoves']).toHaveBeenCalledTimes(1);
    });

    it('should call onPlayerLeft and show popup when a player disconnects', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(service, 'onPlayerLeft').and.callThrough();

        const initialPlayers = [{ name: 'Alice', isConnected: true } as Player, { name: 'Bob', isConnected: false } as Player];
        matchDataServiceSpy.matchData = { ...mockMatch.matchData, players: initialPlayers };

        const updatedPlayers = [{ name: 'Alice', isConnected: true } as Player, { name: 'Bob', isConnected: false } as Player];
        const updatedMatch = { matchData: { players: updatedPlayers } } as Match;
        const updatedPlayerLeftData = { match: updatedMatch, playerName: 'Bob' };

        service['onPlayerLeft'](updatedPlayerLeftData);

        expect(service['onPlayerLeft']).toHaveBeenCalledWith(updatedPlayerLeftData);
        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(updatedPlayerLeftData.match);
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should handle CombatDataBroadcast event and show popup if not involved', () => {
        const initialMatchData = structuredClone(MOCK_MATCH_DATAS[1]);
        matchDataServiceSpy.matchData = initialMatchData;

        const combatDataBroadcast: CombatDataBroadcast = {
            match: { matchData: initialMatchData } as Match,
            playerOneIndex: 1,
            playerTwoIndex: 2,
        };

        matchDataServiceSpy.matchData = combatDataBroadcast.match.matchData;
        service['onCombatDataBroadcast'](combatDataBroadcast);

        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(combatDataBroadcast.match);
        expect(timerServiceSpy.pauseTimer).toHaveBeenCalledWith(combatDataBroadcast.match.matchData.currentTimer / TIME_SCALE);
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Player2 et P3 entrent en combat!');
    });

    it('should handle CombatDataBroadcast event and show popup if not involved', () => {
        const initialMatchData = structuredClone(MOCK_MATCH_DATAS[1]);
        matchDataServiceSpy.matchData = initialMatchData;

        const combatDataBroadcast: CombatDataBroadcast = {
            match: { matchData: initialMatchData } as Match,
            playerOneIndex: 1,
            playerTwoIndex: 2,
        };

        matchDataServiceSpy.matchData = combatDataBroadcast.match.matchData;
        service['onCombatDataBroadcast'](combatDataBroadcast);

        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(combatDataBroadcast.match);
        expect(timerServiceSpy.pauseTimer).toHaveBeenCalledWith(combatDataBroadcast.match.matchData.currentTimer / TIME_SCALE);
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Player2 et P3 entrent en combat!');
    });

    it('should handle combatResultBroadcast timer unfreeze', () => {
        const combatResultBroadcastN: CombatResultBroadcast = {
            match: structuredClone(MOCK_MATCHES[0]),
            combatResult: {
                winnerId: '',
                loserId: PLAYER_IDS[0],
            },
        };

        service['onCombatResultBroadcast'](combatResultBroadcastN);
        expect(timerServiceSpy.unPauseTimer).toHaveBeenCalled();
    });

    it('should handle MatchEnded event and navigate after delay', () => {
        jasmine.clock().install();

        const mockMatchData = structuredClone(MOCK_MATCH_DATAS[0]);
        mockMatchData.players[0].currentStats.fightsWon = 3;
        mockMatchData.players[1].currentStats.fightsWon = 0;
        mockMatchData.players[2].currentStats.fightsWon = 2;
        const matchCase1: Match = { matchData: mockMatchData } as Match;
        matchDataServiceSpy.matchData = structuredClone(mockMatchData);

        service['onMatchEnded'](matchCase1);
        expect(matchDataServiceSpy.updateMatch).toHaveBeenCalledWith(matchCase1);
        expect(mapServiceSpy.clearOverlays).toHaveBeenCalled();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith(`${mockMatchData.players[0].name} a remporté la partie`);

        mockMatchData.players[0].currentStats.fightsWon = 1;
        mockMatchData.players[1].currentStats.fightsWon = 3;
        mockMatchData.players[2].currentStats.fightsWon = 2;
        const matchCase2: Match = { matchData: mockMatchData } as Match;
        matchDataServiceSpy.matchData = structuredClone(mockMatchData);

        service['onMatchEnded'](matchCase2);
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith(`${mockMatchData.players[1].name} a remporté la partie`);

        jasmine.clock().tick(END_GAME_DELAY);
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
        jasmine.clock().uninstall();
    });

    it('should filter debug messages correctly', () => {
        let capturedPredicate: (message: string) => boolean = () => false;
        popupServiceSpy.removeMessagesByFilter.and.callFake((predicate) => {
            capturedPredicate = predicate;
        });

        service['onDebugModeChanged']({ matchData: { isDebugMode: true } } as Match);

        expect(capturedPredicate('Message avec DEBUG')).toBeTrue();
        expect(capturedPredicate('message normal')).toBeFalse();
    });
});
