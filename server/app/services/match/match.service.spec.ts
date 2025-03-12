import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from './match.service';

describe('GameService', () => {
    let service: GameService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchService],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
