import { MapData } from './MapData';

export interface GameData {
    id: string;
    name: string;
    description: string;
    lastEdited: Date;
    isVisible: boolean;
    mapData: MapData;
    thumbnail: string;
}
