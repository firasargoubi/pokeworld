import { LobbyService } from '@app/services/lobby/lobby.service';
import { GameData } from '@common/interfaces/game-data';
import { Match } from '@common/interfaces/match';
import { Player } from '@common/interfaces/player';
import { Warning } from '@common/interfaces/warning.enum';
import { LobbyEvent } from '@common/interfaces/websocket-event.enum';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { MOCK_MATCHES } from '@common/test-consts/mock-matches';
import { MOCK_PLAYERS } from '@common/test-consts/mock-players';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { LobbyGateway } from './lobby.gateway';

describe('LobbyGateway', () => {
    let gateway: LobbyGateway;
    let mockSocket: SinonStubbedInstance<Socket>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockLobbyService: SinonStubbedInstance<LobbyService>;
    let emitStub: SinonStub;
    let mockGame: GameData;
    let mockMatch: Match;

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        mockLobbyService = createStubInstance<LobbyService>(LobbyService);
        mockServer = createStubInstance<Server>(Server);
        emitStub = stub();

        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyGateway, { provide: LobbyService, useValue: mockLobbyService }, { provide: Server, useValue: mockServer }],
        }).compile();

        gateway = module.get<LobbyGateway>(LobbyGateway);

        gateway['server'] = {
            to: () => ({ emit: emitStub }),
            sockets: { sockets: { get: () => mockSocket } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        mockGame = structuredClone(MOCK_GAME_DATAS[0]);
        mockMatch = structuredClone(MOCK_MATCHES[0]);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should createMatch on createMatch event', () => {
        gateway.createMatch(mockSocket, mockGame);
        expect(mockLobbyService.createMatch.calledWith(mockSocket.id, mockGame)).toBeTruthy();
    });

    it('should joinMatch on joinMatch event', () => {
        const matchCode = '1234';
        gateway.joinMatch(mockSocket, matchCode);
        expect(mockLobbyService.joinMatch.calledWith(mockSocket.id, matchCode)).toBeTruthy();
    });

    it('should leaveMatch on leaveMatch event', () => {
        gateway.leaveMatch(mockSocket);
        expect(mockLobbyService.leaveMatch.calledWith(mockSocket.id)).toBeTruthy();
    });

    it('should kickPlayer on kickPlayer event', () => {
        const targetPlayerId = '1234';
        gateway.kickPlayer(mockSocket, targetPlayerId);
        expect(mockLobbyService.kickPlayer.calledWith(mockSocket.id, targetPlayerId)).toBeTruthy();
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
        expect(mockLobbyService.leaveMatch.calledWith(mockSocket.id)).toBeTruthy();
    });

    it('should join room on connectPlayer', () => {
        const playerId = '1234';
        const matchCode = '5678';
        gateway.connectPlayer(playerId, matchCode);
        expect(mockSocket.join.calledWith(matchCode)).toBeTruthy();
    });

    it('should leave all rooms on disconnectPlayer', () => {
        const playerId = '1234';
        const matchCode = '5678';
        Object.defineProperty(mockSocket, 'rooms', { value: [matchCode] });
        gateway.disconnectPlayer(playerId);
        expect(mockSocket.leave.calledWith(matchCode)).toBeTruthy();
    });

    it('should emit MatchStarted on emitMatchStarted', () => {
        const matchCode = '1234';
        gateway.emitMatchStarted(matchCode, mockMatch);
        expect(emitStub.calledWith(LobbyEvent.MatchStarted, mockMatch)).toBeTruthy();
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

    it('should emit PlayerLeft on emitPlayerLeft', () => {
        const matchCode = '1234';
        gateway.emitPlayerLeft(matchCode, mockMatch);
        expect(emitStub.calledWith(LobbyEvent.PlayerLeft, mockMatch)).toBeTruthy();
    });

    it('should emit Warning on warn', () => {
        const playerId = '1234';
        const warningMessage = Warning.RoomLocked;
        gateway.warn(playerId, warningMessage);
        expect(mockSocket.emit.calledWith(LobbyEvent.Warning, warningMessage)).toBeTruthy();
    });

    it('should emit GameData on emitGameDataToPlayer', () => {
        const clientId = '1234';
        const gameData = structuredClone(MOCK_GAME_DATAS[0]);
        gateway.emitGameDataToPlayer(clientId, gameData);
        expect(mockSocket.emit.calledWith(LobbyEvent.EmitGameData, gameData)).toBeTruthy();
    });
});
