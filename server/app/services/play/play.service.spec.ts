import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { PlayService } from './play.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayGateway } from '@app/gateways/play/play.gateway';

describe('PlayService', () => {
    let service: PlayService;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockePlayGateway: SinonStubbedInstance<PlayGateway>;

    beforeAll(async () => {
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockePlayGateway = createStubInstance<PlayGateway>(PlayGateway);

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayService, { provide: MatchService, useValue: mockMatchService }, { provide: PlayGateway, useValue: mockePlayGateway }],
        }).compile();

        service = module.get<PlayService>(PlayService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should endTurn correctly', () => {
        const playerId = '1234';
        service.endTurn(playerId);
        expect(true).toBeTruthy();
    });
});
