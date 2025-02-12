import { Component, inject } from '@angular/core';
import { MapService } from '@app/services/map/map.service';
import { ItemComponent } from '@app/components/item/item.component';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    imports: [ItemComponent],
})
export class MapComponent {
    mapService: MapService = inject(MapService);
}
