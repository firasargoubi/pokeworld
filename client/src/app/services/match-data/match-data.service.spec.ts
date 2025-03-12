import { TestBed } from '@angular/core/testing';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MatchDataService } from './match-data.service';

describe('MatchDataService', () => {
    let service: MatchDataService;
    let mockGameDataService: jasmine.SpyObj<GameDataService>;

    beforeEach(() => {
        mockGameDataService = jasmine.createSpyObj('GameDataService', []);

        TestBed.configureTestingModule({
            providers: [MatchDataService, { provide: GameDataService, useValue: mockGameDataService }],
        });
        service = TestBed.inject(MatchDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
