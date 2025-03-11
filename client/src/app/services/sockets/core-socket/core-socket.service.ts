// core-socket.service.ts
import { Injectable } from '@angular/core';
import { LobbyEvents } from '@common/lobby-events.enum';
import { Observable, Observer } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CoreSocketService {
    private socket: Socket;
    private status = new Observable<boolean>((observer: Observer<boolean>) => {
        this.socket.on('connect', () => observer.next(true));
        this.socket.on('disconnect', () => observer.next(false));
    });

    constructor() {
        this.socket = io(environment.socketUrl, {
            transports: ['websocket'],
            upgrade: false,
        });
        this.setupCoreListeners();
    }

    get connectionStatus(): Observable<boolean> {
        return this.status;
    }
    // Methodes generiques
    emit<T, C>(event: string, ...args: T[] | [...T[], C]): void {
        const lastArg = args[args.length - 1];

        if (typeof lastArg === 'function') {
            const callback = args.pop() as C;
            this.socket.emit(event, ...args, callback);
        } else {
            this.socket.emit(event, ...args);
        }
    }

    on<T>(event: string, callback: (...args: T[]) => void): void {
        this.socket.on(event, callback);
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    private setupCoreListeners(): void {
        this.socket.on('hello', (message: string) => window.console.log('Server:', message));
        this.socket.on('clock', (time: string) => window.console.log('Server time:', time));
        this.socket.on(LobbyEvents.Debug, (message: string) => {
            window.console.log('Debug message from server:', message);
        });
    }
}
