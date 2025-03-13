import { Test, TestingModule } from '@nestjs/testing';
import { TurnService } from './turn.service';

describe('MatchService', () => {
    let service: TurnService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TurnService],
        }).compile();

        service = module.get<TurnService>(TurnService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
