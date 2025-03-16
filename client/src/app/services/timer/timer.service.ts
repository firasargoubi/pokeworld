import { Injectable } from '@angular/core';
import { DEFAULT_MAX_TIME, DEFAULT_TIME, ONE_SECOND, TIMER_START_DELAY } from './timer.service.const';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    maxTime: number = DEFAULT_MAX_TIME;
    lastStartTime: number = DEFAULT_MAX_TIME;
    currentTime: number = DEFAULT_TIME;
    interval: number | null = null;

    startTimer(time: number) {
        this.stopInterval();
        this.maxTime = time;
        this.currentTime = time + 1;
        this.startInterval();
    }

    private startInterval() {
        this.interval = window.setInterval(this.intervalTrigger.bind(this), ONE_SECOND);
        window.setTimeout(this.intervalTrigger.bind(this), TIMER_START_DELAY);
    }

    private stopInterval() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    private intervalTrigger() {
        this.currentTime--;

        if (this.currentTime === 0) {
            this.stopInterval();
        }
    }
}
