import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { MatchService } from './match.service';

describe('MatchService', () => {
    let service: MatchService;
    let mockGameService: SinonStubbedInstance<GameService>;

    beforeAll(async () => {
        mockGameService = createStubInstance<GameService>(GameService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchService, { provide: GameService, useValue: mockGameService }],
        }).compile();

        service = module.get<MatchService>(MatchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
