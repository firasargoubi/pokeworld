import { Overlay, OverlayConfig, OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { Subject } from 'rxjs';
import { PopupService } from './popup.service';

@Component({
    selector: 'app-warning-confirmation-popup',
    template: '<div></div>',
    standalone: true,
})
class MockWarningConfirmationPopupComponent {
    message = '';
    isConfirmation = false;
    closed = new Subject<boolean>();
}

describe('PopupService', () => {
    let service: PopupService;
    let overlay: Overlay;
    let overlayContainer: OverlayContainer;
    let routerEventsSubject: Subject<NavigationEnd>;

    const SHOW_DELAY = 1500;
    const FADE_DELAY = 500;
    const TOTAL_DELAY = SHOW_DELAY + FADE_DELAY;

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
        overlay = TestBed.inject(Overlay);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    // private methods

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear messages and overlays on clearMessages', () => {
        service.showPopup('Test message');
        service.clearMessages();

        expect((service as any).messages.length).toBe(0);
        expect((service as any).overlayRefs.length).toBe(0);
    });

    it('should keep overlayRefs on navigation when keepMessages is called', () => {
        service.showPopup('Test message');
        service.keepMessages();

        routerEventsSubject.next(new NavigationEnd(1, '/edit', '/admin'));
        expect((service as any).overlayRefs.length).toBe(1);
    });

    it('should create overlay with correct configuration', () => {
        const spy = spyOn(overlay, 'create').and.callThrough();

        // Test confirmation popup
        service.showPopup('Confirmation', true);
        const config: OverlayConfig | undefined = spy.calls.mostRecent().args[0];
        if (config) {
            expect(config.hasBackdrop).toBeTrue();
            expect(config.backdropClass).toContain('confirmation-backdrop-class');
        }
    });

    it('should execute action on confirmation', fakeAsync(() => {
        const actionSpy = jasmine.createSpy('action');
        service.showPopup('Confirmation', true, actionSpy);

        const overlayRef = (service as any).overlayRefs[0];
        const component = overlayRef.getConfig().data.componentInstance;
        component.closed.next(true);

        expect(actionSpy).toHaveBeenCalled();
    }));

    it('should auto-close regular popup after delay', fakeAsync(() => {
        service.showPopup('Regular message');
        expect((service as any).overlayRefs.length).toBe(1);

        tick(TOTAL_DELAY);
        expect((service as any).overlayRefs.length).toBe(0);
    }));

    it('should adjust z-index correctly', () => {
        service.showPopup('Test');
        const container = overlayContainer.getContainerElement();
        expect(container.style.zIndex).toBe('2');

        (service as any).setOverlayZIndexLow();
        expect(container.style.zIndex).toBe('-1');
    });

    it('should clear messages on navigation by default', () => {
        service.showPopup('Test');
        routerEventsSubject.next(new NavigationEnd(1, '/new', '/new'));

        expect((service as any).overlayRefs.length).toBe(0);
    });
});
