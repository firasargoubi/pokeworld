import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { LobbyService } from './lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { LobbyGateway } from '@app/gateways/lobby/lobby.gateway';

describe('LobbyService', () => {
    let service: LobbyService;
    let mockGameService: SinonStubbedInstance<GameService>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockeLobbyGateway: SinonStubbedInstance<LobbyGateway>;

    beforeAll(async () => {
        mockGameService = createStubInstance<GameService>(GameService);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockeLobbyGateway = createStubInstance<LobbyGateway>(LobbyGateway);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LobbyService,
                { provide: GameService, useValue: mockGameService },
                { provide: MatchService, useValue: mockMatchService },
                { provide: LobbyGateway, useValue: mockeLobbyGateway },
            ],
        }).compile();

        service = module.get<LobbyService>(LobbyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
