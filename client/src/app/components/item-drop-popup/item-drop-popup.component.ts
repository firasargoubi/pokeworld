import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { ItemType } from '@common/interfaces/item-type.enum';

@Component({
    selector: 'app-item-drop-popup',
    templateUrl: './item-drop-popup.component.html',
    styleUrls: ['./item-drop-popup.component.scss'],
    imports: [ItemComponent, PokeballButtonComponent, CommonModule],
})
export class ItemDropPopupComponent {
    @Input() inventoryItems: ItemType[] = [ItemType.Item1, ItemType.Item2, ItemType.Item3];
    @Output() itemSelected = new EventEmitter<ItemType>();
    selectedItem: number = 2;

    validateChoise() {
        // eslint-disable-next-line no-console
        console.log(this.inventoryItems[this.selectedItem]);
        this.itemSelected.emit(this.inventoryItems[this.selectedItem]);
    }
}
