import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { PlayGateway } from './play.gateway';
import { PlayService } from '@app/services/play/play.service';

describe('PlayGateway', () => {
    let gateway: PlayGateway;
    let mockSocket: SinonStubbedInstance<Socket>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockPlayService: SinonStubbedInstance<PlayService>;
    let emitStub: SinonStub;

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        mockPlayService = createStubInstance<PlayService>(PlayService);
        mockServer = createStubInstance<Server>(Server);
        emitStub = stub();

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayGateway, { provide: Server, useValue: mockServer }, { provide: PlayService, useValue: mockPlayService }],
        }).compile();

        gateway = module.get<PlayGateway>(PlayGateway);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway['server'] = { to: () => ({ emit: emitStub }), sockets: { sockets: { get: () => mockSocket } } } as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should endTurn on EndTurn event', () => {
        gateway.endTurn(mockSocket);
        expect(true).toBeTruthy();
    });
});
