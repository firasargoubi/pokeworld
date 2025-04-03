import { PlayService } from '@app/services/play/play.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { PlayGateway } from './play.gateway';
import { MatchService } from '@app/services/match/match.service';
import { Match } from '@app/classes/match/match';

describe('PlayGayteway', () => {
    let gateway: PlayGateway;
    let mockSocket: SinonStubbedInstance<Socket>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockPlayService: SinonStubbedInstance<PlayService>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let emitStub: SinonStub;
    let mockMatch: SinonStubbedInstance<Match>;

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        mockPlayService = createStubInstance<PlayService>(PlayService);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockServer = createStubInstance<Server>(Server);
        emitStub = stub();
        mockMatch = createStubInstance<Match>(Match);
        mockMatchService.getMatchFromPlayerId.returns(mockMatch);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayGateway,
                { provide: MatchService, useValue: mockMatchService },
                { provide: PlayService, useValue: mockPlayService },
                { provide: Server, useValue: mockServer },
            ],
        }).compile();

        gateway = module.get<PlayGateway>(PlayGateway);

        gateway['server'] = {
            to: () => ({ emit: emitStub }),
            sockets: { sockets: { get: () => mockSocket } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 'any' used to mock a partial Server object
        } as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should call end turn on end turn event', () => {
        gateway.endTurn(mockSocket);
        expect(mockPlayService.endTurn.calledWith(mockMatch)).toBeTruthy();
    });

    it('should call move on move event', () => {
        const position = { x: 2, y: 2 };
        gateway.move(mockSocket, position);
        expect(mockPlayService.move.calledWith(mockMatch, mockSocket.id, position)).toBeTruthy();
    });

    it('should call action on action event', () => {
        const position = { x: 2, y: 2 };
        gateway.action(mockSocket, position);
        expect(mockPlayService.action.calledWith(mockMatch, mockSocket.id, position)).toBeTruthy();
    });

    it('should call debug move on debug move event', () => {
        const position = { x: 2, y: 2 };
        gateway.debugMove(mockSocket, position);
        expect(mockPlayService.debugMove.calledWith(mockMatch, mockSocket.id, position)).toBeTruthy();
    });

    it('should call change debug mode on change debug mode event', () => {
        const isLocked = true;
        gateway.changeDebugMode(mockSocket, isLocked);
        expect(mockPlayService.changeDebugMode.calledWith(mockMatch, mockSocket.id, isLocked)).toBeTruthy();
    });
});
