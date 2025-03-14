import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server } from 'socket.io';
import { PlayGateway } from './play.gateway';
import { MatchService } from '@app/services/match/match.service';

describe('PlayGateway', () => {
    let gateway: PlayGateway;
    // let mockSocket: SinonStubbedInstance<Socket>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let emitStub: SinonStub;

    beforeEach(async () => {
        // mockSocket = createStubInstance<Socket>(Socket);
        mockServer = createStubInstance<Server>(Server);
        mockMatchService = createStubInstance<MatchService>(MatchService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayGateway, { provide: Server, useValue: mockServer }, { provide: MatchService, useValue: mockMatchService }],
        }).compile();

        emitStub = stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        mockServer.to.returns({ emit: emitStub } as any);
        gateway = module.get<PlayGateway>(PlayGateway);
        gateway['server'] = mockServer;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
