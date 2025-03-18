import { PlayService } from '@app/services/play/play.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { PlayGateway } from './play.gateway';
import { CombatDataBroadcast, CombatResultBroadcast } from '@common/interfaces/combat';
import { Match, PlayerMovementData } from '@common/interfaces/match';
import { Position } from '@common/interfaces/position';
import { PlayEvent } from '@common/interfaces/websocket-event.enum';
import { MOCK_MATCHES } from '@common/test-consts/mock-matches';

describe('PlayGateway', () => {
    let gateway: PlayGateway;
    let mockSocket: SinonStubbedInstance<Socket>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockPlayService: SinonStubbedInstance<PlayService>;
    let emitStub: SinonStub;
    let mockMatch: Match;
    let matchCode: string;

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        mockPlayService = createStubInstance<PlayService>(PlayService);
        mockServer = createStubInstance<Server>(Server);
        emitStub = stub();

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayGateway, { provide: PlayService, useValue: mockPlayService }, { provide: Server, useValue: mockServer }],
        }).compile();

        gateway = module.get<PlayGateway>(PlayGateway);

        gateway['server'] = {
            to: () => ({ emit: emitStub }),
            sockets: { sockets: { get: () => mockSocket } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 'any' used to mock a partial Server object
        } as any;
        mockMatch = structuredClone(MOCK_MATCHES[0]);
        matchCode = 'match123';
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should endTurn on EndTurn event', () => {
        gateway.endTurn(mockSocket);
        expect(mockPlayService.endTurn.calledWith(mockSocket.id)).toBeTruthy();
    });

    it('should getPossibleMoves on GetPossibleMoves event', () => {
        const expectedMoves: Position[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        mockPlayService.getPossibleMoves.returns(expectedMoves);

        const result = gateway.getPossibleMoves(mockSocket);

        expect(mockPlayService.getPossibleMoves.calledWith(mockSocket.id)).toBeTruthy();
        expect(result).toEqual(expectedMoves);
    });

    it('should getHoverMoves on GetHoverMoves event', () => {
        const position: Position = { x: 3, y: 4 };
        const expectedMoves: Position[] = [
            { x: 3, y: 5 },
            { x: 4, y: 4 },
        ];
        mockPlayService.getHoverMoves.returns(expectedMoves);

        const result = gateway.getHoverMoves(mockSocket, position);

        expect(mockPlayService.getHoverMoves.calledWith(mockSocket.id, position)).toBeTruthy();
        expect(result).toEqual(expectedMoves);
    });

    it('should getActions on GetActions event', () => {
        const expectedActions: Position[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        mockPlayService.getActions.returns(expectedActions);

        const result = gateway.getActions(mockSocket);

        expect(mockPlayService.getActions.calledWith(mockSocket.id)).toBeTruthy();
        expect(result).toEqual(expectedActions);
    });

    it('should move on Move event', () => {
        const position: Position = { x: 5, y: 6 };
        gateway.move(mockSocket, position);
        expect(mockPlayService.move.calledWith(mockSocket.id, position)).toBeTruthy();
    });

    it('should action on Action event', () => {
        const position: Position = { x: 7, y: 8 };
        gateway.action(mockSocket, position);
        expect(mockPlayService.action.calledWith(mockSocket.id, position)).toBeTruthy();
    });

    it('should changeDebugMode on ChangeDebugMode event', () => {
        gateway.changeDebugMode(mockSocket);
        expect(mockPlayService.changeDebugMode.calledWith(mockSocket.id)).toBeTruthy();
    });

    it('should emit PlayerMoved on emitPlayerMoved', () => {
        const movementData: PlayerMovementData = {
            playerIndex: 0,
            movement: [
                { x: 0, y: 0 },
                { x: 2, y: 2 },
                { x: 3, y: 3 },
            ],
            match: {} as Match,
        };

        gateway.emitPlayerMoved(matchCode, movementData);
        expect(emitStub.calledWith(PlayEvent.PlayerMoved, movementData)).toBeTruthy();
    });

    it('should emit MatchStarted on emitMatchStarted', () => {
        gateway.emitMatchStarted(matchCode, mockMatch);
        expect(emitStub.calledWith(PlayEvent.MatchStarted, mockMatch)).toBeTruthy();
    });

    it('should emit BridgeChanged on emitBridgeChanged', () => {
        gateway.emitBridgeChanged(matchCode, mockMatch);
        expect(emitStub.calledWith(PlayEvent.BridgeChanged, mockMatch)).toBeTruthy();
    });

    it('should emit TurnStarted on emitTurnStarted', () => {
        gateway.emitTurnStarted(matchCode, mockMatch);
        expect(emitStub.calledWith(PlayEvent.TurnStarted, mockMatch)).toBeTruthy();
    });

    it('should emit PreTurnStarted on emitPreTurnStarted', () => {
        gateway.emitPreTurnStarted(matchCode, mockMatch);
        expect(emitStub.calledWith(PlayEvent.PreTurnStarted, mockMatch)).toBeTruthy();
    });

    it('should emit DebugModeChanged on emitDebugModeChanged', () => {
        gateway.emitDebugModeChanged(matchCode, mockMatch);
        expect(emitStub.calledWith(PlayEvent.DebugModeChanged, mockMatch)).toBeTruthy();
    });

    it('should emit CombatDataBroadcast on emitCombatDataBroadcast', () => {
        const combatDataBroadcast: CombatDataBroadcast = {
            match: mockMatch,
            playerOneIndex: 0,
            playerTwoIndex: 1,
        };

        gateway.emitCombatDataBroadcast(matchCode, combatDataBroadcast);
        expect(emitStub.calledWith(PlayEvent.CombatDataBroadcast, combatDataBroadcast)).toBeTruthy();
    });

    it('should emit CombatResultBroadcast on emitCombatResultBroadcast', () => {
        const combatResultBroadcast: CombatResultBroadcast = {
            match: mockMatch,
            combatResult: {
                winnerId: 'player1',
                loserId: 'player2',
            },
        };

        gateway.emitCombatResultBroadcast(matchCode, combatResultBroadcast);
        expect(emitStub.calledWith(PlayEvent.CombatResultBroadcast, combatResultBroadcast)).toBeTruthy();
    });

    it('should emit MatchEnded on emitMatchEnded', () => {
        gateway.emitMatchEnded(matchCode, mockMatch);
        expect(emitStub.calledWith(PlayEvent.MatchEnded, mockMatch)).toBeTruthy();
    });
});
