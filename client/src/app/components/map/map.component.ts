import { Component, inject, Input } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { MapService } from '@app/services/map/map.service';
import { Position } from '@common/interfaces/position';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    imports: [ItemComponent],
})
export class MapComponent {
    @Input() isEditor: boolean = false;
    mapService: MapService = inject(MapService);
    private playService: PlayService = inject(PlayService);
    private lastHover: Position = { x: -1, y: -1 };

    onHover(position: Position) {
        const hoveringLastTile = this.lastHover.x !== position.x || this.lastHover.y !== position.y;
        if (!this.isEditor && hoveringLastTile) {
            this.lastHover = position;
            this.playService.setHoverMoves(position);
        }
    }

    clickTile(position: Position) {
        if (!this.isEditor) {
            this.playService.clickTile(position);
        }
    }

    rightClickTile(event: MouseEvent, position: Position) {
        if (!this.isEditor) {
            event.preventDefault();
            this.playService.rightClickTile(position);
        }
    }
}
