import { PlayGateway } from '@app/gateways/play/play.gateway';
import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStubbedInstance, createStubInstance } from 'sinon';
import { PlayService } from './play.service';

describe('PlayService', () => {
    let service: PlayService;
    let sandbox: SinonSandbox;
    let mockPlayGateway: SinonStubbedInstance<PlayGateway>;
    let mockMatchService: SinonStubbedInstance<MatchService>;
    let mockMovementService: SinonStubbedInstance<MovementService>;
    let mockCombatService: SinonStubbedInstance<CombatService>;

    beforeAll(async () => {
        mockPlayGateway = createStubInstance<PlayGateway>(PlayGateway);
        mockMatchService = createStubInstance<MatchService>(MatchService);
        mockMovementService = createStubInstance<MovementService>(MovementService);
        mockCombatService = createStubInstance<CombatService>(CombatService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayService,
                { provide: PlayGateway, useValue: mockPlayGateway },
                { provide: MatchService, useValue: mockMatchService },
                { provide: MovementService, useValue: mockMovementService },
                { provide: CombatService, useValue: mockCombatService },
            ],
        }).compile();

        service = module.get<PlayService>(PlayService);
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });
});
