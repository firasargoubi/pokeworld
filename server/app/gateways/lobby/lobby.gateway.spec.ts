import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { LobbyGateway } from './lobby.gateway';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { Player } from '@common/player';
import { MOCK_MATCHES, MOCK_PLAYERS } from '@app/consts/tests/mock-matches';
import { LobbyEvent } from '@common/lobby-event.enum';

describe('LobbyGateway', () => {
    let gateway: LobbyGateway;
    let mockSocket: SinonStubbedInstance<Socket>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockLobbyService: SinonStubbedInstance<LobbyService>;
    let emitStub: SinonStub;

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        mockLobbyService = createStubInstance<LobbyService>(LobbyService);
        mockServer = createStubInstance<Server>(Server);
        emitStub = stub();

        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyGateway, { provide: Server, useValue: mockServer }, { provide: LobbyService, useValue: mockLobbyService }],
        }).compile();

        gateway = module.get<LobbyGateway>(LobbyGateway);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway['server'] = { to: () => ({ emit: emitStub }), sockets: { sockets: { get: () => mockSocket } } } as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should createMatch on createMatch event', () => {
        const gameId = '1234';
        gateway.createMatch(mockSocket, gameId);
        expect(mockLobbyService.createMatch.calledWith(mockSocket.id, gameId)).toBeTruthy();
    });

    it('should startMatch on startMatch event', () => {
        gateway.startMatch(mockSocket);
        expect(mockLobbyService.startMatch.calledWith(mockSocket.id)).toBeTruthy();
    });

    it('should leaveMatch on leaveMatch event', () => {
        gateway.leaveMatch(mockSocket);
        expect(mockLobbyService.leaveMatch.calledWith(mockSocket.id)).toBeTruthy();
    });

    it('should tryKickPlayer on kickPlayer event', () => {
        const targetPlayerId = '1234';
        gateway.kickPlayer(mockSocket, targetPlayerId);
        expect(mockLobbyService.tryKickPlayer.calledWith(mockSocket.id, targetPlayerId)).toBeTruthy();
    });

    it('should updatePlayer on updatePlayer event', () => {
        const partialPlayer: Partial<Player> = { name: 'sam' };
        gateway.updatePlayer(mockSocket, partialPlayer);
        expect(mockLobbyService.updatePlayer.calledWith(mockSocket.id, partialPlayer)).toBeTruthy();
    });

    it('should startMatch on startMatch event', () => {
        gateway.startMatch(mockSocket);
        expect(mockLobbyService.startMatch.calledWith(mockSocket.id)).toBeTruthy();
    });

    it('should changeLockStatus on changeLockStatus event', () => {
        const lockStatus = true;
        gateway.changeLockStatus(mockSocket, lockStatus);
        expect(mockLobbyService.changeLockStatus.calledWith(mockSocket.id, lockStatus)).toBeTruthy();
    });

    it('should leaveMatch on handleDisconnect', () => {
        gateway.handleDisconnect(mockSocket);
        expect(mockLobbyService.leaveMatch.called).toBeTruthy();
    });

    it('should join room on connectPlayer', () => {
        const playerId = '1234';
        const matchCode = '5678';
        gateway.connectPlayer(playerId, matchCode);
        expect(mockSocket.join.calledWith(matchCode)).toBeTruthy();
    });

    it('should leave room on disconnectPlayer', () => {
        const playerId = '1234';
        const matchCode = '5678';
        Object.defineProperty(mockSocket, 'rooms', { value: [matchCode] });
        gateway.disconnectPlayer(playerId);
        expect(mockSocket.leave.calledWith(matchCode)).toBeTruthy();
    });

    it('should emit MatchStarted on emitMatchStarted', () => {
        const matchCode = '1234';
        gateway.emitMatchStarted(matchCode, MOCK_MATCHES[0]);
        expect(emitStub.calledWith(LobbyEvent.MatchStarted, MOCK_MATCHES[0])).toBeTruthy();
    });

    it('should emit LockStatusChanged on emitLockStatusChanged', () => {
        const matchCode = '1234';
        const lockedStatus = true;
        gateway.emitLockStatusChanged(matchCode, lockedStatus);
        expect(emitStub.calledWith(LobbyEvent.LockStatusChanged, lockedStatus)).toBeTruthy();
    });

    it('should emit UpdatePlayerList on emitUpdatePlayerList', () => {
        const matchCode = '1234';
        const players = MOCK_PLAYERS;
        gateway.emitUpdatePlayerList(matchCode, players);
        expect(emitStub.calledWith(LobbyEvent.UpdatePlayerList, players)).toBeTruthy();
    });

    it('should emit RemovedFromMatch on emitRemovedFromMatch', () => {
        const clientId = '1234';
        gateway.emitRemovedFromMatch(clientId);
        expect(mockSocket.emit.calledWith(LobbyEvent.RemovedFromMatch)).toBeTruthy();
    });
});
