import { Component, Input, OnChanges } from '@angular/core';
import { ITEM_IMAGES } from '@app/consts/images.const';
import { ITEM_DESCRIPTION } from '@app/consts/items.const';
import { ItemType } from '@common/item-type.enum';

@Component({
    selector: 'app-item',
    standalone: true,
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnChanges {
    @Input() itemType: ItemType;
    @Input() x: number;
    @Input() y: number;
    description: string;
    image: string;

    ngOnChanges() {
        this.description = ITEM_DESCRIPTION.get(this.itemType) as string;
        this.image = ITEM_IMAGES.get(this.itemType) as string;
    }
}
