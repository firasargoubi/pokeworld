import { PlayService } from '@app/services/play/play.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonSandbox, SinonStubbedInstance, createSandbox, createStubInstance } from 'sinon';
import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
    let service: LobbyService;
    let sandbox: SinonSandbox;
    let mockPlayService: SinonStubbedInstance<PlayService>;

    beforeAll(async () => {
        sandbox = createSandbox();
        mockPlayService = createStubInstance<PlayService>(PlayService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyService, { provide: PlayService, useValue: mockPlayService }],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should kick player if host and not kicking themselves', () => {
        const match = {
            isHost: sandbox.stub().returns(true),
            kickPlayer: sandbox.stub(),
            sendUpdate: sandbox.stub(),
        } as unknown as Match;
        const playerId = 'hostId';
        const targetPlayerId = 'targetId';
    
        service.kickPlayer(match, playerId, targetPlayerId);
    
        expect(match.kickPlayer.calledWith(targetPlayerId, Message.Kick)).toBeTruthy();
        expect(match.sendUpdate.calledOnce).toBeTruthy();
    });
});
