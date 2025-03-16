import { Component, inject, Input } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { MapService } from '@app/services/map/map.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';

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

    onHover(x: number, y: number) {
        if (!this.isEditor) {
            this.playSocketsService.setHoverMoves({ x, y });
        }
    }

    onClick(x: number, y: number, overlay: string | null) {
        if (!this.isEditor && overlay) {
            this.playSocketsService.move({ x, y });
        }
    }
}
