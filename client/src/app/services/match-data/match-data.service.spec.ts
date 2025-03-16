import { TestBed } from '@angular/core/testing';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { Match } from '@common/match';
import { MatchDataService } from './match-data.service';
import { MOCK_MATCHES } from '@app/consts/tests/mock-matches';

describe('MatchDataService', () => {
    let service: MatchDataService;
    let mockGameDataService: jasmine.SpyObj<GameDataService>;
    const mockMatch: Match = structuredClone(MOCK_MATCHES[0]);

    beforeEach(() => {
        mockGameDataService = jasmine.createSpyObj('GameDataService', ['setGameData', 'getMapSize']);

        TestBed.configureTestingModule({
            providers: [MatchDataService, { provide: GameDataService, useValue: mockGameDataService }],
        });
        service = TestBed.inject(MatchDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start match by setting game data, match data, and selfIndex', () => {
        const socketId = mockMatch.matchData.players[0].id;

        service.startMatch(mockMatch, socketId);

        expect(mockGameDataService.setGameData).toHaveBeenCalledWith(mockMatch.gameData);
        expect(service.matchData).toEqual(mockMatch.matchData);
        expect(service.selfIndex).toBe(0);
    });

    it('should set selfIndex to -1 if socketId is not found in players', () => {
        const socketId = 'unknownSocketId';

        service.startMatch(mockMatch, socketId);
        expect(mockGameDataService.setGameData).toHaveBeenCalledWith(mockMatch.gameData);
        expect(service.matchData).toEqual(mockMatch.matchData);

        expect(service.selfIndex).toBe(-1);
    });
});
