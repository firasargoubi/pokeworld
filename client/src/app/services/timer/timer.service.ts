import { Injectable } from '@angular/core';
import { DEFAULT_TIME, TIME_SCALE, TIMER_START_DELAY } from './timer.service.const';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    maxTime: number = DEFAULT_TIME;
    lastUnpauseTime: number = DEFAULT_TIME;
    currentTime: number = DEFAULT_TIME;
    interval: number | null = null;
    isStarted: boolean = false;

    startTimer(time: number) {
        this.isStarted = false;
        this.maxTime = time;
        this.lastUnpauseTime = time;
        this.currentTime = time;
        this.startInterval();
        window.setTimeout(this.intervalTrigger.bind(this), TIMER_START_DELAY);
    }

    pauseTimer(remainingTime: number) {
        this.isStarted = false;
        this.stopInterval();
        this.lastUnpauseTime = remainingTime;
    }

    unPauseTimer() {
        this.isStarted = true;
        this.startInterval();
    }

    private startInterval() {
        this.stopInterval();
        this.interval = window.setInterval(this.intervalTrigger.bind(this), TIME_SCALE);
    }

    private stopInterval() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    private intervalTrigger() {
        this.isStarted = true;
        this.currentTime--;

        if (this.currentTime === 0) {
            this.stopInterval();
        }
    }
}
