import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
    let service: LobbyService;
    let mockGameService: SinonStubbedInstance<GameService>;

    beforeAll(async () => {
        mockGameService = createStubInstance<GameService>(GameService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyService, { provide: GameService, useValue: mockGameService }],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
