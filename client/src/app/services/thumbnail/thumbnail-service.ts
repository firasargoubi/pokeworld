import { Injectable } from '@angular/core';
import { BoardVisualService } from '@app/services/board-visual/board-visual.service';
import { MapData } from '@common/map-data';

const TILE_SIZE = 32;
const BACKGROUND_COLOR = 'rgb(106, 183, 215)';

@Injectable({
    providedIn: 'root',
})
export class ThumbnailService {
    constructor(private boardVisualService: BoardVisualService) {}

    async getThumbnail(map: MapData): Promise<string> {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = map.size * TILE_SIZE;
        canvas.height = map.size * TILE_SIZE;

        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const loadImage = async (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
        };

        for (let x = 0; x < map.tiles.length; x++) {
            for (let y = 0; y < map.tiles[x].length; y++) {
                const imagePath = this.boardVisualService.getTileImage(map.tiles, { x, y });
                try {
                    const img = await loadImage(imagePath);
                    context.drawImage(img, y * TILE_SIZE, x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } catch (error) {
                    continue;
                }
            }
        }

        return canvas.toDataURL('image/png');
    }
}
