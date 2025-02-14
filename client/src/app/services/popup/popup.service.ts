import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { filter } from 'rxjs/operators';

const fadeDelay = 1000;
const showDelay = 3000;

interface PopupMessage {
    message: string;
    isConfirmation: boolean;
    action?: () => void;
}

@Injectable({
    providedIn: 'root',
})
export class PopupService {
    private messages: PopupMessage[] = [];
    private overlayRefs: OverlayRef[] = [];
    private keepMessagesOnNavigation: boolean = false;

    constructor(
        private overlay: Overlay,
        private router: Router,
    ) {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (!this.keepMessagesOnNavigation) {
                this.clearMessages();
            }
            this.keepMessagesOnNavigation = false;
        });
    }

    showPopup(message: string, isConfirmation: boolean = false, action?: () => void) {
        this.messages.push({ message, isConfirmation, action });
        this.displayPopup();
    }

    clearMessages() {
        this.messages = [];
        this.overlayRefs.forEach((ref) => ref.dispose());
        this.overlayRefs = [];
    }

    keepMessages() {
        this.keepMessagesOnNavigation = true;
    }

    private displayPopup() {
        const overlayConfig = this.getOverlayConfig();
        const overlayRef = this.overlay.create(overlayConfig);
        this.overlayRefs.push(overlayRef);
        this.setOverlayZIndexHigh();

        const popupPortal = new ComponentPortal(WarningConfirmationPopupComponent);
        const popupComponentRef = overlayRef.attach(popupPortal);

        const currentMessage = this.messages.shift();
        if (currentMessage) {
            popupComponentRef.instance.message = currentMessage.message;
            popupComponentRef.instance.isConfirmation = currentMessage.isConfirmation;
            popupComponentRef.instance.closed.subscribe((confirmed: boolean) => {
                this.handlePopupClose(confirmed, overlayRef, currentMessage);
            });

            setTimeout(() => {
                this.fadeOutPopup(overlayRef);
            }, showDelay);
        }
    }

    private fadeOutPopup(overlayRef: OverlayRef) {
        const overlayElement = overlayRef.overlayElement;
        overlayElement.classList.add('fade-out');
        setTimeout(() => {
            this.handlePopupClose(false, overlayRef, null);
        }, fadeDelay);
    }

    private getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            hasBackdrop: false,
            backdropClass: 'custom-backdrop-class',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
            scrollStrategy: this.overlay.scrollStrategies.noop(),
        });
    }

    private handlePopupClose(confirmed: boolean, overlayRef: OverlayRef, message: PopupMessage | null) {
        if (message && message.isConfirmation && confirmed && message.action) {
            message.action();
        }

        overlayRef.dispose();
        this.overlayRefs = this.overlayRefs.filter((ref) => ref !== overlayRef);

        if (this.messages.length > 0) {
            this.displayPopup();
        } else if (this.overlayRefs.length === 0) {
            this.setOverlayZIndexLow();
        }
    }

    private setOverlayZIndexLow() {
        const overlayContainer = document.querySelector('.cdk-overlay-container');
        if (overlayContainer) {
            overlayContainer.setAttribute('style', 'z-index: -1');
        }
    }

    private setOverlayZIndexHigh() {
        const overlayContainer = document.querySelector('.cdk-overlay-container');
        if (overlayContainer) {
            overlayContainer.setAttribute('style', 'z-index: 2');
        }
    }
}
