import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { CoreSocketService } from './core-socket.service';
import { Socket } from 'socket.io-client';

describe('CoreSocketService', () => {
    let service: CoreSocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CoreSocketService);
        socketHelper = new SocketTestHelper();
        service['socket'] = socketHelper as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should provide connection status as an observable', () => {
        expect(service.connectionStatus).toBeTruthy();

        service.connectionStatus.subscribe((value) => {
            expect(value).toBeDefined();
        });
    });

    it('should return socket id through selfId getter', () => {
        Object.defineProperty(service['socket'], 'id', { value: 'test-socket-id' });
        expect(service.selfId).toBe('test-socket-id');
    });

    it('should emit event with arguments', () => {
        const spy = spyOn(service['socket'], 'emit');
        const event = 'testEvent';
        const data1 = 'data1';
        const data2 = { key: 'value' };

        service.emit(event, data1, data2);

        expect(spy).toHaveBeenCalledWith(event, data1, data2);
    });

    it('should emit event with data and callback', () => {
        const spy = spyOn(service['socket'], 'emit');
        const event = 'testEvent';
        const data = 'testData';
        const callback = jasmine.createSpy('callback');

        service.emit(event, data, callback);

        expect(spy).toHaveBeenCalledWith(event, data, callback);
    });

    it('should register event listener on socket', () => {
        const spy = spyOn(service['socket'], 'on');
        const event = 'testEvent';
        const callback = jasmine.createSpy('callback');

        service.on(event, callback);

        expect(spy).toHaveBeenCalledWith(event, callback);
    });

    it('should execute callback when event is emitted', () => {
        const event = 'testEvent';
        const callbackSpy = jasmine.createSpy('callback');
        const testData = { message: 'test' };

        service.on(event, callbackSpy);
        (service['socket'] as unknown as SocketTestHelper).peerSideEmit(event, testData);

        expect(callbackSpy).toHaveBeenCalledWith(testData);
    });

    it('should update status through private setStatusConnected method', () => {
        service['setStatusConnected']();

        service.connectionStatus.subscribe((status) => {
            expect(status).toBeTrue();
        });
    });

    it('should update status through private setStatusDisconnected method', () => {
        service['setStatusConnected']();
        service['setStatusDisconnected']();

        service.connectionStatus.subscribe((status) => {
            expect(status).toBeFalse();
        });
    });
});
