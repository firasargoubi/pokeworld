import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-warning-confirmation-popup',
    templateUrl: './warning-confirmation-popup.component.html',
    styleUrls: ['./warning-confirmation-popup.component.scss'],
})
export class WarningConfirmationPopupComponent {
    @Input() message: string = '';
    @Input() hasCloseButton: boolean = false;
    @Input() isConfirmation: boolean = false;
    @Output() closed = new EventEmitter<boolean>();

    onConfirm() {
        this.closed.emit(true);
    }

    onCancel() {
        this.closed.emit(false);
    }
}
