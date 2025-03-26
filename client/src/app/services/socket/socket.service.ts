import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io(environment.socketUrl, {
            transports: ['websocket'],
            upgrade: false,
        });
    }

    get selfId(): string {
        return this.socket.id as string;
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
