import { Injectable } from '@angular/core';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { TileType } from '@common/tile-type.enum';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    private basePath = '/assets/images/game/';

    getTile(tile: TileType): string {
        return `${this.basePath}tiles/${String(tile).toLowerCase()}.png`;
    }
    getItem(item: ItemType): string {
        return `${this.basePath}items/${String(item).toLowerCase()}.png`;
    }
    getTileByNumber(tile: TileType, imageNumber: number): string {
        let formattedNumber = String(imageNumber);
        if (tile === TileType.Path || tile === TileType.Water) {
            formattedNumber = Number(imageNumber).toString(2).padStart(8, '0');
        }
        return `${this.basePath}tiles/${String(tile).toLowerCase()}-${formattedNumber}.png`;
    }

    generateMapPreview(map: MapData): Promise<string> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                return;
            }
            const TILE_SIZE = 32;
            const rows = map.tiles.length;
            const cols = map.tiles[0].length;
            canvas.width = map.tiles.length * TILE_SIZE;
            canvas.height = map.tiles[0].length * TILE_SIZE;

            const promises: Promise<void>[] = [];

            for (let x = 0; x < rows; x++) {
                for (let y = 0; y < cols; y++) {
                    const tile = map.tiles[x][y];
                    const tileImage = new Image();
                    tileImage.src = this.getTile(tile);
                    const promise = new Promise<void>((resolveTile) => {
                        tileImage.onload = () => {
                            context.drawImage(tileImage, y * TILE_SIZE, x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                            resolveTile();
                        };
                    });
                    promises.push(promise);
                }
            }
            Promise.all(promises).then(() => {
                resolve(canvas.toDataURL('image/png'));
            });
        });
    }
}
// getMap()
// private generateThumbnail()
