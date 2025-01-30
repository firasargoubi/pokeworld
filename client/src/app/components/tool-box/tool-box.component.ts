import { Component, EventEmitter, Input, OnInit, Output, WritableSignal, signal } from '@angular/core';
import { itemIndex } from '@app/interfaces/item-metadata';
import { ItemType } from '@common/item-type.enum';
import { TileType } from '@common/tile-type.enum';
import { tileIndex } from '@app/interfaces/tile-metadata';
import { ToolBoxElement, ToolBoxSet } from '@app/interfaces/tool-box-element';

@Component({
    selector: 'app-tool-box',
    imports: [],
    templateUrl: './tool-box.component.html',
    styleUrl: './tool-box.component.scss',
})
export class ToolBoxComponent implements OnInit {
    @Input() activeToolSet: ToolBoxSet;
    @Output() activeToolSetChange = new EventEmitter<ToolBoxSet>();
    @Input() itemCount: { [key in ItemType]: number } = {} as { [key in ItemType]: number };

    tileIndex = tileIndex;
    tileList = Object.keys(tileIndex) as TileType[];

    itemIndex = itemIndex;
    itemList: ItemType[];

    isHoovered: WritableSignal<boolean> = signal(false);
    hooveredElement: WritableSignal<ToolBoxElement> = signal(TileType.None);
    isSelected: WritableSignal<boolean> = signal(false);

    ngOnInit() {
        this.itemList = Object.keys(ItemType) as ItemType[];
    }

    changeActiveTile(selectedTile: TileType): void {
        this.activeToolSet.tileType = selectedTile;
        this.activeToolSetChange.emit(this.activeToolSet);
    }

    handleHover(event: MouseEvent) {
        const toolBoxElement = this.getToolBoxElement(event);
        if (toolBoxElement !== undefined) {
            if (event.type === 'mouseover') {
                this.hooveredElement.set(toolBoxElement);
                this.isHoovered.set(true);
            } else {
                this.isHoovered.set(false);
            }
        }
    }

    checkValidHoover(tileType: ToolBoxElement) {
        return this.isHoovered() && this.hooveredElement() === tileType;
    }

    handleTileSelection(event: MouseEvent) {
        const tileType = this.getToolBoxElement(event) as TileType;
        if (tileType) {
            this.isSelected.set(true);
            this.changeActiveTile(tileType);
        }
    }

    checkTileSelection(tileType: TileType) {
        return this.isSelected() && this.activeToolSet.tileType === tileType;
    }

    changeActiveItem(itemType: ItemType) {
        this.activeToolSet.itemType = itemType;
        this.activeToolSetChange.emit(this.activeToolSet);
    }

    handleItemSelection(event: MouseEvent) {
        const itemType = this.getToolBoxElement(event) as ItemType;
        const isValidItemSelection = itemType && !this.isItemUnavailable(itemType);
        if (isValidItemSelection) {
            this.changeActiveItem(itemType);
        }
    }

    checkMultiItem(itemType: ItemType) {
        return [ItemType.Random, ItemType.Spawn].includes(itemType);
    }

    isItemUnavailable(itemType: ItemType) {
        if (!(itemType in this.itemCount)) {
            return true;
        }

        return this.itemCount[itemType] <= 0;
    }

    private getToolBoxElement(event: MouseEvent) {
        const hooveredElement = event.target as HTMLElement;
        const toolBoxElement: ToolBoxElement = hooveredElement.getAttribute('toolBoxElement') as ToolBoxElement;
        return toolBoxElement;
    }
}
