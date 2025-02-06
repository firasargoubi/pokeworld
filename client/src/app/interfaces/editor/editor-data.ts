import { EditorItem } from './editor-item';
import { EditorTile } from './editor-tile';

export interface EditorData {
    tiles: EditorTile[];
    items: EditorItem[];
    errorMessage: string;
}
