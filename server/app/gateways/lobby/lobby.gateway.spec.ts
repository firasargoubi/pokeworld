import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { LobbyGateway } from './lobby.gateway';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { Player } from '@common/player';

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

        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyGateway, { provide: Server, useValue: mockServer }, { provide: LobbyService, useValue: mockLobbyService }],
        }).compile();

        gateway = module.get<LobbyGateway>(LobbyGateway);

        gateway['server'] = {
            sockets: {
                sockets: {
                    get: () => mockSocket,
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        mockServer.to.returns({ emit: emitStub } as any);
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
        const playerId = 'player1';
        const matchCode = 'match123';
        gateway.connectPlayer(playerId, matchCode);
        expect(mockSocket.join.calledWith(matchCode)).toBeTruthy();
    });
});
