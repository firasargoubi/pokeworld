import { UserService } from '@app/services/user/user.service';
import { CHALLENGE_TILE_BONUS } from '@common/consts/challenge-data.const';
import { ChallengeType } from '@common/interfaces/challenge-data';
import { MapData } from '@common/interfaces/map-data';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ChallengeService } from './challenge.service';

describe('ChallengeService', () => {
    let service: ChallengeService;
    let mockUserService: SinonStubbedInstance<UserService>;
    let mockMapData: MapData;

    beforeEach(async () => {
        mockUserService = createStubInstance(UserService);
        mockMapData = structuredClone(MOCK_MATCH_DATAS[0]).gameData.mapData;
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChallengeService, { provide: UserService, useValue: mockUserService }],
        }).compile();

        service = module.get<ChallengeService>(ChallengeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('assignChallenge', () => {
        it('should assign a challenge from possible challenges', () => {
            const challenge = service.assignChallenge(mockMapData);
            expect(challenge).toBeDefined();
            expect(challenge.type).toBeDefined();
        });

        it('should create an Explorer challenge with correct target', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            const challenge = service.assignChallenge(mockMapData);
            expect(challenge.type).toBe(ChallengeType.Explorer);
            expect(challenge.target).toBe(mockMapData.size + CHALLENGE_TILE_BONUS);
        });
    });
});
