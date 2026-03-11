import { GameState } from './game-state.enum';
import { MapData } from './map-data';
import { Owner } from './owner';

export interface GameData {
    _id: string;
    name: string;
    description: string;
    lastEdited: Date;
    mapData: MapData;
    thumbnail?: string;
    owner : Owner ;
    gameState : GameState;
    isVisible?: boolean // temp
}
