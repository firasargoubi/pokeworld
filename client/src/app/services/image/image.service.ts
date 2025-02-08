import { Injectable } from '@angular/core';
import { ItemType } from '@common/item-type.enum';
import { TileType } from '@common/tile-type.enum';

// TODO mettre dans un fichier de constantes
const IMAGE_PATH = 'assets/images/';
const TILE_PATH = 'game/tiles/';
const ITEM_PATH = 'game/items/';
const IMAGE_SUFIX = '.png';

@Injectable({
    providedIn: 'any',
})
export class ImageService {
    getTile(tool: TileType): string {
        const toolName: string = tool.toLowerCase();
        return `${IMAGE_PATH}${TILE_PATH}${toolName}${IMAGE_SUFIX}`;
    }

    getItem(item: ItemType): string {
        const itemName: string = item.toLowerCase();
        return `${IMAGE_PATH}${ITEM_PATH}${itemName}${IMAGE_SUFIX}`;
    }
}
