import { inject, Injectable } from '@angular/core';
import { ITEM_IMAGES } from '@app/consts/images.const';
import { MapService } from '@app/services/map/map.service';
import { ItemType } from '@common/item-type.enum';
import { MapData } from '@common/map-data';
import { MapSize } from '@common/map-size.enum';
import { Position } from '@common/position';
import { BACKGROUND_COLOR, TILE_SIZE } from './thumbnail.service.const';

@Injectable({
    providedIn: 'root',
})
export class ThumbnailService {
    private mapService: MapService = inject(MapService);

    async getThumbnail(map: MapData, loadItems: boolean): Promise<string> {
        const { canvas, context } = this.createCanvas(map.size);
        const tilesPromises: Promise<[HTMLImageElement, number, number] | null>[] = [];
        const itemsPromises: Promise<[HTMLImageElement, number, number] | null>[] = [];

        this.loadTiles(map, tilesPromises);
        if (loadItems) {
            this.loadItems(map, itemsPromises);
        }

        await this.renderImages(context, tilesPromises);
        await this.renderImages(context, itemsPromises);

        return canvas.toDataURL('image/png');
    }

    private createCanvas(size: MapSize): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        canvas.width = size * TILE_SIZE;
        canvas.height = size * TILE_SIZE;

        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, canvas.width, canvas.height);

        return { canvas, context };
    }

    private loadTiles(map: MapData, promises: Promise<[HTMLImageElement, number, number] | null>[]): void {
        for (let x = 0; x < map.tiles.length; x++) {
            for (let y = 0; y < map.tiles[x].length; y++) {
                const imagePath = this.mapService.getTileImage(map.tiles, { x, y });
                promises.push(this.loadImage(imagePath, x, y));
            }
        }
    }

    private loadItems(map: MapData, promises: Promise<[HTMLImageElement, number, number] | null>[]): void {
        for (const [itemType, positions] of Object.entries(map.items) as [ItemType, Position[]][]) {
            const itemImage = ITEM_IMAGES.get(itemType) as string;
            if (itemImage) {
                for (const position of positions) {
                    promises.push(this.loadImage(itemImage, position.x, position.y));
                }
            }
        }
    }

    private async renderImages(context: CanvasRenderingContext2D, promises: Promise<[HTMLImageElement, number, number] | null>[]) {
        for await (const result of promises) {
            if (result) {
                const [image, x, y] = result;
                context.drawImage(image, y * TILE_SIZE, x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    private async loadImage(imageUrl: string, x: number, y: number): Promise<[HTMLImageElement, number, number] | null> {
        return new Promise((resolve) => {
            const image = new Image();
            image.src = imageUrl;
            image.onload = () => resolve([image, x, y]);
            image.onerror = () => resolve(null);
        });
    }
}
