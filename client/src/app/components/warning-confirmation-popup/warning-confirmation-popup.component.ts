import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-warning-confirmation-popup',
    templateUrl: './warning-confirmation-popup.component.html',
    styleUrls: ['./warning-confirmation-popup.component.scss'],
})
export class WarningConfirmationPopupComponent {
    @Input() message: string = '';
    @Output() closed = new EventEmitter<void>();

    onClose() {
        this.closed.emit();
    }
}
