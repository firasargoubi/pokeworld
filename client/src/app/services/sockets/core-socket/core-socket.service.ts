// core-socket.service.ts
import { Injectable } from '@angular/core';
import { LobbyEvent } from '@common/lobby-event.enum';
import { Observable, Observer } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CoreSocketService {
    private socket: Socket;
    private status: Observable<boolean>;

    constructor() {
        this.socket = io(environment.socketUrl, {
            transports: ['websocket'],
            upgrade: false,
        });
        this.status = new Observable<boolean>((observer: Observer<boolean>) => {
            this.socket.on('connect', () => observer.next(true));
            this.socket.on('disconnect', () => observer.next(false));
        });
        this.setupCoreListeners();
    }

    get connectionStatus(): Observable<boolean> {
        return this.status;
    }

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
        // TODO TEMP retirer cela avant la remise du sprint 2
        this.socket.on(LobbyEvent.DebugMessage, (message: string) => {
            window.console.log('DebugMessage:', message);
        });
    }
}
