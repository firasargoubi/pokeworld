import { inject, Injectable } from '@angular/core';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { MatchEvent } from '@common/match-event.enum';

@Injectable({
    providedIn: 'root',
})
export class MatchSocketsService {
    private coreSocket: CoreSocketService;

    constructor() {
        this.coreSocket = inject(CoreSocketService);
        this.setupMatchListeners();
    }

    private setupMatchListeners(): void {
        this.coreSocket.on(MatchEvent.Temp, () => {
            window.console.log('MatchSocketsService recieved event: Temp');
        });
    }
}
