// TODO create tests for board visual service

import { TestBed } from '@angular/core/testing';
import { BoardVisualService } from './board-visual.service';

describe('BoardVisualService', () => {
    let service: BoardVisualService;

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
