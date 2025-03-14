import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { PlayService } from './play.service';

describe('PlayService', () => {
    let service: PlayService;
    let mockGameService: SinonStubbedInstance<GameService>;

    beforeAll(async () => {
        mockGameService = createStubInstance<GameService>(GameService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayService, { provide: GameService, useValue: mockGameService }],
        }).compile();

        service = module.get<PlayService>(PlayService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
