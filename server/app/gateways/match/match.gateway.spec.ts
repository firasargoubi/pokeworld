import { Match } from '@app/classes/match/match';
import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
import { CreateMatchPayload, MatchSettings } from '@common/interfaces/match-data';
import { MatchEvent } from '@common/interfaces/socket-event.enum';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let mockSocket: SinonStubbedInstance<Socket>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockUserService: SinonStubbedInstance<UserService>;
    let emitStub: SinonStub;
    let mockMatch: SinonStubbedInstance<Match>;

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockUserService = createStubInstance<UserService>(UserService);
        mockServer = createStubInstance<Server>(Server);
        emitStub = stub();
        mockMatch = createStubInstance<Match>(Match);
        mockMatchService.getMatchFromPlayerId.returns(mockMatch);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,
                { provide: UserService, useValue: mockUserService },
                { provide: MatchService, useValue: mockMatchService },
                { provide: Server, useValue: mockServer },
            ],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);

        gateway['server'] = {
            to: () => ({ emit: emitStub }),
            sockets: { sockets: { get: () => mockSocket } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 'any' used to mock a partial Server object
        } as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should call create match on create match event', () => {
        const mockGameData = structuredClone(MOCK_GAME_DATAS[0]);
        const matchSettings: MatchSettings = {
            isElementalMode: false,
            isDropInEnabled: true,
            isRapidElimination: false,
            entryFee: 6,
            isFriendOnly: true,
        };
        mockUserService.getUserId.returns('user123');
        const payload: CreateMatchPayload = { gameData: mockGameData, matchSettings };
        gateway.createMatch(mockSocket, payload);
        expect(mockMatchService.createMatch.calledWith('user123', mockGameData, matchSettings)).toBeTruthy();
    });

    it('should call join match on join match event', () => {
        const matchCode = '1234';
        mockUserService.getUserId.returns('user123');
        gateway.joinMatch(mockSocket, { matchCode, confirmJoinBlockedUser: false });
        expect(mockMatchService.joinMatch.calledWith('user123', matchCode)).toBeTruthy();
    });

    it('should call leave match on leave match event', () => {
        mockUserService.getUserId.returns('user123');
        gateway.leaveMatch(mockSocket);
        expect(mockMatchService.leaveMatch.calledWith('user123')).toBeTruthy();
    });

    it('should call leave match on handle disconnect', () => {
        mockUserService.getUserId.returns('user123');
        gateway.handleDisconnect(mockSocket);
        expect(mockMatchService.leaveMatch.called).toBeTruthy();
    });

    it('should not create a match when the socket is not associated to a user', async () => {
        mockUserService.getUserId.returns(undefined);

        const payload: CreateMatchPayload = {
            gameData: structuredClone(MOCK_GAME_DATAS[0]),
            matchSettings: {
                isElementalMode: false,
                isDropInEnabled: true,
                isRapidElimination: false,
                entryFee: 0,
                isFriendOnly: false,
            },
        };

        const result = await gateway.createMatch(mockSocket, payload);

        expect(result).toBeNull();
        expect(mockMatchService.createMatch.called).toBeFalsy();
    });

    it('should not join a match when the socket is not associated to a user', async () => {
        mockUserService.getUserId.returns(undefined);

        const result = await gateway.joinMatch(mockSocket, { matchCode: '1234', confirmJoinBlockedUser: false });

        expect(result).toBeNull();
        expect(mockMatchService.joinMatch.called).toBeFalsy();
    });

    it('should not leave a match when the socket is not associated to a user', () => {
        mockUserService.getUserId.returns(undefined);

        gateway.leaveMatch(mockSocket);

        expect(mockMatchService.leaveMatch.called).toBeFalsy();
    });

    it('should connect player to match', () => {
        const playerId = 'player1';
        const matchCode = '1234';
        gateway.connectPlayer(playerId, matchCode);
        expect(mockSocket.join.calledWith(matchCode)).toBeTruthy();
    });

    it('should disconnect player from match', () => {
        const playerId = 'player1';
        const matchCode = '1234';
        Object.defineProperty(mockSocket, 'rooms', {
            writable: true,
            value: [matchCode],
        });
        gateway.disconnectPlayer(playerId);
        expect(mockSocket.leave.calledWith(matchCode)).toBeTruthy();
    });

    it('should emit update', () => {
        const matchCode = '1234';
        const matchData = structuredClone(MOCK_MATCH_DATAS[0]);
        gateway.emitUpdate(matchCode, matchData);
        expect(emitStub.calledWith(MatchEvent.Update, matchData)).toBeTruthy();
    });

    it('should emit message to host', () => {
        const matchCode = '1234';
        const message = 'hello';
        const toHost = true;
        const expectedPayload = {
            message,
            hasCloseButton: toHost,
        };
        mockUserService.getSocketId.returns(matchCode);
        gateway.emitMessage(matchCode, message, toHost);

        expect(mockSocket.emit.calledWith(MatchEvent.Message, expectedPayload)).toBeTruthy();
    });

    it('should emit message to room', () => {
        const matchCode = '1234';
        const message = 'hello';
        const toHost = false;
        const expectedPayload = {
            message,
            hasCloseButton: toHost,
        };

        gateway.emitMessage(matchCode, message, toHost);

        expect(emitStub.calledWith(MatchEvent.Message, expectedPayload)).toBeTruthy();
    });

    it('should emit removed from match', () => {
        const matchCode = '1234';
        const reason = 'hello';
        gateway.emitRemovedFromMatch(matchCode, reason);
        expect(mockSocket.emit.calledWith(MatchEvent.RemovedFromMatch, reason)).toBeTruthy();
    });

    it('should emit message with close button', () => {
        const matchCode = '1234';
        const message = 'hello';
        const toHost = true;
        const expectedPayload = {
            message,
            hasCloseButton: toHost,
        };
        mockUserService.getSocketId.returns(matchCode);
        gateway.emitMessage(matchCode, message, toHost);

        expect(mockSocket.emit.calledWith(MatchEvent.Message, expectedPayload)).toBeTruthy();
    });
});
