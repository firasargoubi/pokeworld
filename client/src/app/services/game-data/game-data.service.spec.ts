import { TestBed } from '@angular/core/testing';
import { GameDataService } from './game-data.service';

describe('GameDataService', () => {
    let service: GameDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
        });
        service = TestBed.inject(TestBed);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
