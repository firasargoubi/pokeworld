import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/components/header/header.component';
import { ItemComponent } from '@app/components/item/item.component';
import { MapComponent } from '@app/components/map/map.component';
import { EditorService } from '@app/services/editor/editor.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [HeaderComponent, MapComponent, FormsModule, ItemComponent],
})
export class EditPageComponent implements OnInit {
    editorService: EditorService = inject(EditorService);

    ngOnInit() {
        this.editorService.initialGameData = structuredClone(this.editorService.gameDataService.gameData);
    }
}
