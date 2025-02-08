import { Component, inject } from '@angular/core';
import { HeaderComponent } from '@app/components/header/header.component';
import { BoardComponent } from '@app/components/board/board.component';
import { EditorService } from '@app/services/editor/editor.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss'],
    imports: [HeaderComponent, BoardComponent],
})
export class EditPageComponent {
    editorService: EditorService = inject(EditorService);
}
