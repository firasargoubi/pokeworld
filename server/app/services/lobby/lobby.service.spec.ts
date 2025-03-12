import { Test, TestingModule } from '@nestjs/testing';
import { LobbyService } from './lobby.service';

describe('MatchService', () => {
    let service: LobbyService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyService],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
