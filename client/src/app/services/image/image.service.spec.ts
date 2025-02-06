// TODO create tests

import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;

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
