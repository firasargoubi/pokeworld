import { MapSize } from './map-data';
import { Player } from './player';

export interface RoomData {
    gameCode: string;
    players: Player[];
    locked: boolean;
    autoLocked: boolean;
    mapSize: MapSize;
}
