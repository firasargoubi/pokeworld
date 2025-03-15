import { Component, inject, Input } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { MapService } from '@app/services/map/map.service';

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
}
