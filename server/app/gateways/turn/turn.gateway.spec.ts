import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { TurnGateway } from './turn.gateway';

describe('TurnGateway', () => {
    let gateway: TurnGateway;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let emitStub: SinonStub;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [TurnGateway],
        }).compile();
        gateway = module.get<TurnGateway>(TurnGateway);

        emitStub = stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        server.to.returns({ emit: emitStub } as any);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
        expect(socket).toBeDefined();
    });
});
