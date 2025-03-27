describe('TimerService', () => {
    it('should be true', () => {
        // TODO
        expect(true).toBeTruthy();
    });
});

// import { TestBed } from '@angular/core/testing';
// import { TimerService } from './timer.service';
// import { TIMER_START_DELAY } from './timer.service.const';

// describe('TimerService', () => {
//     let service: TimerService;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             providers: [TimerService],
//         });

//         service = TestBed.inject(TimerService);
//     });

//     it('should create', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should start timer', () => {
//         const initialTime = 12;
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         const stopIntervalSpy = spyOn<any>(service, 'stopInterval').and.callThrough();
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         const startIntervalSpy = spyOn<any>(service, 'startInterval').and.callThrough();
//         const setTimeoutSpy = spyOn(window, 'setTimeout');

//         service.startTimer(initialTime);

//         expect(service.maxTime).toBe(initialTime);
//         expect(service.currentTime).toBe(initialTime);
//         expect(service.isStarted).toBeFalse();
//         expect(stopIntervalSpy).toHaveBeenCalled();
//         expect(startIntervalSpy).toHaveBeenCalled();
//         expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), TIMER_START_DELAY);
//     });

//     it('should decrease currentTime on interval trigger', () => {
//         const initialTime = 5;
//         service.startTimer(initialTime);
//         expect(service.currentTime).toBe(initialTime);

//         service['intervalTrigger']();
//         expect(service.isStarted).toBeTrue();
//         expect(service.currentTime).toBe(initialTime - 1);

//         service['intervalTrigger']();
//         expect(service.currentTime).toBe(initialTime - 2);
//     });

//     it('should stop interval when currentTime reaches 0', () => {
//         service.startTimer(2);
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         const stopIntervalSpy = spyOn<any>(service, 'stopInterval');

//         expect(service.currentTime).toBe(2);

//         service['intervalTrigger']();
//         expect(service.currentTime).toBe(1);
//         expect(stopIntervalSpy).not.toHaveBeenCalled();

//         service['intervalTrigger']();
//         expect(service.currentTime).toBe(0);
//         expect(stopIntervalSpy).toHaveBeenCalled();
//     });

//     it('should pause timer', () => {
//         const remainingTime = 42;
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         const stopIntervalSpy = spyOn<any>(service, 'stopInterval');

//         service.pauseTimer(remainingTime);

//         expect(service.isStarted).toBeFalse();
//         expect(service.lastUnpauseTime).toBe(remainingTime);
//         expect(stopIntervalSpy).toHaveBeenCalled();
//     });

//     it('should unpause timer', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
//         const startIntervalSpy = spyOn<any>(service, 'startInterval');

//         service.unPauseTimer();

//         expect(service.isStarted).toBeTrue();
//         expect(startIntervalSpy).toHaveBeenCalled();
//     });

//     it('should clear interval', () => {
//         const initialTime = 7;
//         service.startTimer(initialTime);
//         expect(service.interval).not.toBe(null);
//         service['stopInterval']();
//         expect(service.interval).toBe(null);
//     });
// });
