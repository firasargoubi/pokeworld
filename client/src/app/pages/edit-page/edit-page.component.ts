import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/components/header/header.component';
import { WarningConfirmationPopupComponent } from '@app/components/warning-confirmation-popup/warning-confirmation-popup.component';
import { EditorService } from '@app/services/editor/editor.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [HeaderComponent, MapComponent, FormsModule, ItemComponent, WarningConfirmationPopupComponent],
})
export class EditPageComponent {
    editorService: EditorService = inject(EditorService);
}
