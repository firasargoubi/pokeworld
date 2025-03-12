// core-socket.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CoreSocketService {
    private socket: Socket;
    private status: BehaviorSubject<boolean>;

    constructor() {
        this.status = new BehaviorSubject<boolean>(false);

        this.socket = io(environment.socketUrl, {
            transports: ['websocket'],
            upgrade: false,
        });

        this.socket.on('connect', () => this.status.next(true));
        this.socket.on('disconnect', () => this.status.next(false));
    }

    get connectionStatus(): Observable<boolean> {
        return this.status.asObservable();
    }

    getSocketId(): string {
        return this.socket.id ?? '';
    }

    disconnect(): void {
        this.socket.disconnect();
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
}
