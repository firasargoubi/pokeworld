import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/components/header/header.component';
import { ItemComponent } from '@app/components/item/item.component';
import { MapComponent } from '@app/components/map/map.component';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { EditorService } from '@app/services/editor/editor.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [HeaderComponent, MapComponent, FormsModule, ItemComponent, WarningConfirmationPopupComponent],
})
export class EditPageComponent implements OnInit {
    editorService: EditorService = inject(EditorService);

    ngOnInit() {
        this.editorService.initialGameData = structuredClone(this.editorService.gameDataService.gameData);
    }

    addMessage(message: string, isConfirmation: boolean = false, action?: () => void) {
        if (!this.editorService.messages.some((msg) => msg.message === message)) {
            this.editorService.messages.push({ message, isConfirmation, action });
        }
    }

    removeMessage(index: number) {
        this.editorService.messages.splice(index, 1);
    }

    handleWarning(condition: boolean, errorMessage: string) {
        if (condition) {
            this.addMessage(errorMessage);
        } else {
            this.editorService.messages = this.editorService.messages.filter((msg) => msg.message !== errorMessage);
        }
    }
}
