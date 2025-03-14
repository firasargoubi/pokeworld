import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { stub } from 'sinon';
import { MOCK_GAMES } from '@app/consts/tests/mock-games';

describe('MatchService', () => {
    let service: MatchService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchService],
        }).compile();

        service = module.get<MatchService>(MatchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should createMatch correctly', () => {
        const matchCode = '1234';
        stub(service, 'getNewMatchCode').returns(matchCode);
        const result = service.createMatch(MOCK_GAMES[0]);
        expect(service['matches'].has(matchCode)).toBeTruthy();
        expect(result).toBe(matchCode);
    });
});
