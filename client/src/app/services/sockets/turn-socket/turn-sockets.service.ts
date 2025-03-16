import { inject, Injectable } from '@angular/core';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { PlayEvent } from '@common/play-event.enum';

@Injectable({
    providedIn: 'root',
})
export class TurnSocketsService {
    private coreSocket: CoreSocketService;

    constructor() {
        this.coreSocket = inject(CoreSocketService);
        this.setupTurnListeners();
    }

    private setupTurnListeners(): void {
        this.coreSocket.on(PlayEvent.TurnStarted, () => {
            // window.console.log('TurnSocketsService recieved event: PlayEvent.TurnStarted');
        });
    }
}
