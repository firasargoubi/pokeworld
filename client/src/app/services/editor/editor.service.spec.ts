import { TestBed } from '@angular/core/testing';
import { EditorService } from './editor.service';

describe('EditorService', () => {
    let service: EditorService;

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
