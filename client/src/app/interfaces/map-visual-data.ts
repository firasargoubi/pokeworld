import { TileVisualData } from '@app/interfaces/tile-visual-data';
import { MapSize } from '@common/map-size.enum';

export interface MapVisualData {
    tiles: TileVisualData[][];
    size: MapSize;
}
