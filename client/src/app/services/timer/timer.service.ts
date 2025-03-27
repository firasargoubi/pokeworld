import { Injectable } from '@angular/core';
import { TIME_SCALE, TURN_WAIT_DURATION } from '@common/consts/match-data.const';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    maxTime: number = TURN_WAIT_DURATION / TIME_SCALE;
    lastUnpauseTime: number = TURN_WAIT_DURATION / TIME_SCALE;
    currentTime: number = Math.floor(TURN_WAIT_DURATION / TIME_SCALE);
    isStarted: boolean = false;
    private interval: number | null = null;

    startTimer() {
        if (!this.isStarted) {
            this.isStarted = true;
            this.startInterval();
        }
    }

    stopTimer(time: number) {
        if (this.isStarted) {
            this.stopInterval();
            this.isStarted = false;
        }
        const roundedTime = time / TIME_SCALE;
        if (this.lastUnpauseTime !== roundedTime) {
            this.lastUnpauseTime = roundedTime;
            this.currentTime = Math.floor(roundedTime);
        }
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
        this.currentTime--;

        if (this.currentTime === 0) {
            this.stopInterval();
        }
    }
}
