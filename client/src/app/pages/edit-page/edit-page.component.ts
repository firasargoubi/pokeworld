import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '@app/components/map/map.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { EditorService } from '@app/services/editor/editor.service';
import { ItemComponent } from '@app/components/item/item.component';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [HeaderComponent, MapComponent, FormsModule, ItemComponent],
})
export class EditPageComponent {
    editorService: EditorService = inject(EditorService);
}
