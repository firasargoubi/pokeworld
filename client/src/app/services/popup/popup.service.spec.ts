/* eslint-disable @typescript-eslint/no-explicit-any */
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { Component, ComponentRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { Subject } from 'rxjs';
import { PopupService } from './popup.service';
import { POPUP_DELAY } from './popup.service.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Component({
    selector: 'app-warning-confirmation-popup',
    template: '',
    standalone: true,
})
class MockWarningConfirmationPopupComponent {
    message = '';
    isConfirmation = false;
    closed = new Subject<boolean>();
}

const HALF_DELAY = POPUP_DELAY / 2;

describe('PopupService', () => {
    let service: PopupService;
    let overlayContainer: OverlayContainer;
    let routerEventsSubject: Subject<NavigationEnd>;
    beforeEach(() => {
        routerEventsSubject = new Subject<NavigationEnd>();

        TestBed.configureTestingModule({
            imports: [MockWarningConfirmationPopupComponent],
            providers: [
                PopupService,
                Overlay,
                {
                    provide: Router,
                    useValue: {
                        events: routerEventsSubject.asObservable(),
                    },
                },
                {
                    provide: WarningConfirmationPopupComponent,
                    useClass: MockWarningConfirmationPopupComponent,
                },
            ],
        });

        service = TestBed.inject(PopupService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear messages and overlays on clearMessages', () => {
        service.showPopup('Test message');
        service.clearMessages();

        expect(service['messages'].length).toBe(0);
        expect(service['overlayRefs'].length).toBe(0);
    });

    it('should keep overlayRefs on navigation when keepMessages is called', () => {
        service.showPopup('Test message');
        service.keepMessages();

        routerEventsSubject.next(new NavigationEnd(1, PageEndpoint.Edit, PageEndpoint.Admin));
        expect(service['overlayRefs'].length).toBe(1);
    });

    it('should execute action on confirmation', fakeAsync(() => {
        const actionSpy = jasmine.createSpy('action');
        service.showPopup('Confirmation', true, actionSpy);

        tick(); // Laisser le popup s'afficher

        const popupComponent = service.popupComponents[0];
        expect(popupComponent).toBeDefined();

        popupComponent.closed.next(true);
        tick();

        expect(actionSpy).toHaveBeenCalled();
    }));

    it('should auto-close regular popup after delay', fakeAsync(() => {
        service.showPopup('Regular message');
        expect(service['overlayRefs'].length).toBe(1);

        tick(POPUP_DELAY);
        expect(service['overlayRefs'].length).toBe(0);
    }));

    it('should adjust z-index correctly', () => {
        service.showPopup('Test');
        const container = overlayContainer.getContainerElement();
        expect(container.style.zIndex).toBe('2');

        service['setOverlayZIndexLow']();
        expect(container.style.zIndex).toBe('-1');
    });

    it('should clear messages on navigation by default', () => {
        service.showPopup('Test');
        routerEventsSubject.next(new NavigationEnd(1, '/new', '/new'));

        expect(service['overlayRefs'].length).toBe(0);
    });

    it('should handle multiple messages in sequence', fakeAsync(() => {
        service.showPopup('First message');
        expect(service['overlayRefs'].length).toBe(1);
        tick(HALF_DELAY);

        service.showPopup('Second message');
        expect(service['overlayRefs'].length).toBe(2);

        tick(HALF_DELAY);
        expect(service['overlayRefs'].length).toBe(1);
    }));

    it('should set and reset z-index correctly', () => {
        service.showPopup('Test');
        const container = overlayContainer.getContainerElement();
        expect(container.style.zIndex).toBe('2');

        service.clearMessages();
        expect(container.style.zIndex).toBe('-1');
    });

    it('should access popup components via getter', () => {
        service.showPopup('Test message');
        const popupComponents = service.popupComponents;
        expect(popupComponents.length).toBe(1);
        expect(popupComponents[0].message).toBe('Test message');
    });

    it('should return null when no popups are active', () => {
        expect(service.popupComponents.length).toBe(0);

        service.showPopup('Test message');
        expect(service.popupComponents.length).toBe(1);

        service.clearMessages();
        expect(service.popupComponents.length).toBe(0);
    });

    it('should display next popup when a popup is closed', fakeAsync(() => {
        service.showPopup('First message');
        service.showPopup('Second message');

        expect(service.popupComponents.length).toBe(2);

        service.popupComponents[0].closed.next(false);
        tick();

        expect(service.popupComponents.length).toBe(1);
        expect(service.popupComponents[0].message).toBe('Second message');

        service.popupComponents[0].closed.next(false);
        tick();

        expect(service.popupComponents.length).toBe(0);
    }));

    it('should do nothing when no message is queued', () => {
        service['messages'] = [];
        service['displayPopup']();
        expect(service['overlayRefs'].length).toBe(0);
    });

    it('should remove messages by filter', () => {
        service['messages'] = [
            { message: 'debug info', isConfirmation: false },
            { message: 'other message', isConfirmation: false },
        ];

        const mockOverlayRef1 = jasmine.createSpyObj('OverlayRef', ['dispose']);
        const mockOverlayRef2 = jasmine.createSpyObj('OverlayRef', ['dispose']);

        service['overlayRefs'] = [
            {
                overlayRef: mockOverlayRef1,
                componentRef: {
                    instance: { message: 'debug info' } as WarningConfirmationPopupComponent,
                } as ComponentRef<WarningConfirmationPopupComponent>,
            },
            {
                overlayRef: mockOverlayRef2,
                componentRef: {
                    instance: { message: 'other message' } as WarningConfirmationPopupComponent,
                } as ComponentRef<WarningConfirmationPopupComponent>,
            },
        ];

        spyOn<any>(service, 'setOverlayZIndexLow');

        service.removeMessagesByFilter((msg) => msg.includes('debug'));

        expect(service['messages'].length).toBe(1);
        expect(service['messages'][0].message).toBe('other message');
        expect(mockOverlayRef1.dispose).toHaveBeenCalled();
        expect(mockOverlayRef2.dispose).not.toHaveBeenCalled();
        expect(service['overlayRefs'].length).toBe(1);
        expect(service['setOverlayZIndexLow']).not.toHaveBeenCalled();

        service['overlayRefs'][0].componentRef.instance.message = 'debug too';
        service.removeMessagesByFilter((msg) => msg.includes('debug') || msg.includes('other'));
        expect(service['setOverlayZIndexLow']).toHaveBeenCalled();
        expect(service['overlayRefs'].length).toBe(0);
    });
});
