import { Component, inject, Input } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { MapService } from '@app/services/map/map.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
import { Position } from '@common/position';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    imports: [ItemComponent],
})
export class MapComponent {
    @Input() isEditor = false;
    mapService: MapService = inject(MapService);
    playSocketsService: PlaySocketsService = inject(PlaySocketsService);
    private lastHover: Position = { x: -1, y: -1 };

    onHover(x: number, y: number) {
        if (!this.isEditor && (this.lastHover.x !== x || this.lastHover.y !== y)) {
            this.lastHover = { x, y };
            this.playSocketsService.setHoverMoves({ x, y });
        }
    }

    clickTile(x: number, y: number) {
        if (!this.isEditor) {
            this.playSocketsService.clickTile({ x, y });
        }
    }
}
