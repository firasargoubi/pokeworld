import { inject, Injectable } from '@angular/core';
import { CombatEvent } from '@common/interfaces/socket-event.enum';
import { SocketService } from '@app/services/socket/socket.service';

@Injectable({
    providedIn: 'root',
})
export class CombatService {
    private socketService: SocketService = inject(SocketService);

    escape(): void {
        this.socketService.emit(CombatEvent.Escape);
    }

    attack(): void {
        this.socketService.emit(CombatEvent.Attack);
    }
}
