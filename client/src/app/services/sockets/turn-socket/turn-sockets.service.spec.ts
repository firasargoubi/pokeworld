import { TestBed } from '@angular/core/testing';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { PlayEvent } from '@common/play-event.enum';
import { TurnSocketsService } from './turn-sockets.service';

describe('TurnSocketsService', () => {
    let service: TurnSocketsService;
    let coreSocketSpy: jasmine.SpyObj<CoreSocketService>;

    beforeEach(() => {
        coreSocketSpy = jasmine.createSpyObj('CoreSocketService', ['on', 'emit'], { selfId: 'selfId' });

        TestBed.configureTestingModule({
            providers: [{ provide: CoreSocketService, useValue: coreSocketSpy }],
        });

        service = TestBed.inject(TurnSocketsService);
        service['setupTurnListeners']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register listener for TurnStarted event', () => {
        const turnStartedCall = coreSocketSpy.on.calls.allArgs().find((args) => args[0] === PlayEvent.TurnStarted);
        expect(turnStartedCall).toBeDefined();
        expect(coreSocketSpy.on).toHaveBeenCalledWith(PlayEvent.TurnStarted, jasmine.any(Function));
    });
});
