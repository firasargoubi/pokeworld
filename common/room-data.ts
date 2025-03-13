import { MapSize } from './map-size.enum';
import { Player } from './player';

export interface RoomData {
    gameCode: string;
    players: Player[];
    locked: boolean;
    autoLocked: boolean;
    mapSize: MapSize;
}
