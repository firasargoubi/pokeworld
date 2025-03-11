import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TimerService],
        });

        service = TestBed.inject(TimerService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should start timer', () => {
        const initialTime = 12;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stopIntervalSpy = spyOn<any>(service, 'stopInterval');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startIntervalSpy = spyOn<any>(service, 'startInterval');
        service.startTimer(initialTime);
        expect(service.maxTime).toBe(initialTime);
        expect(service.currentTime).toBe(initialTime + 1);
        expect(stopIntervalSpy).toHaveBeenCalled();
        expect(startIntervalSpy).toHaveBeenCalled();
    });

    it('should decrease currentTime on interval trigger', () => {
        const initialTime = 5;
        service.startTimer(initialTime);
        expect(service.currentTime).toBe(initialTime + 1);
        service['intervalTrigger']();
        expect(service.currentTime).toBe(initialTime);
        service['intervalTrigger']();
        expect(service.currentTime).toBe(initialTime - 1);
    });

    it('should stop interval when currentTime reaches 0', () => {
        service.startTimer(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stopIntervalSpy = spyOn<any>(service, 'stopInterval');
        service['intervalTrigger']();
        service['intervalTrigger']();
        expect(service.currentTime).toBe(0);
        expect(stopIntervalSpy).toHaveBeenCalled();
    });

    it('should clear interval', () => {
        const initialTime = 7;
        service.startTimer(initialTime);
        expect(service.interval).not.toBe(null);
        service['stopInterval']();
        expect(service.interval).toBe(null);
    });
});
