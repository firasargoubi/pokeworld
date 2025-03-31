import { TIME_SCALE } from '@common/consts/match-data.const';

export class Timer {
    maxTime: number = 0;
    lastUnpauseTime: number = 0;
    currentTime: number = 0;
    isStarted: boolean = false;
    private interval: number | null = null;

    constructor(time: number) {
        const scaledTime = time / TIME_SCALE;
        this.maxTime = scaledTime;
        this.lastUnpauseTime = scaledTime;
        this.currentTime = Math.ceil(scaledTime);
    }

    startTimer() {
        if (!this.isStarted) {
            this.isStarted = true;
            this.startInterval();
        }
    }

    restartTimer(time: number) {
        if (this.isStarted) {
            this.stopInterval();
            this.isStarted = false;
        }
        const scaledTime = time / TIME_SCALE;
        this.lastUnpauseTime = scaledTime;
        this.maxTime = scaledTime;
        this.currentTime = Math.ceil(scaledTime);
        this.startTimer();
    }

    pauseTimer(time: number) {
        if (this.isStarted) {
            this.stopInterval();
            this.isStarted = false;
        }
        const scaledTime = time / TIME_SCALE;
        this.lastUnpauseTime = scaledTime;
        this.currentTime = Math.ceil(scaledTime);
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
