import { TileDescriptionInfo } from '@app/interfaces/tile-description';
import { TileType } from '@common/interfaces/tile-type.enum';

export const TILE_DESCRIPTION: Map<TileType, string> = new Map([
    [TileType.Path, '<b>Chemin</b>Accélère la vitesse des joueurs'],
    [TileType.Bush, '<b>Buisson</b>Ralenti la vitesse des joueurs'],
    [TileType.Water, '<b>Eau</b>Bloque le passage des joueurs'],
    [TileType.Bridge, '<b>Pont</b>Peut être brisé ou réparé'],
    [TileType.BrokenBridge, '<b>Pont</b>Peut être brisé ou réparé'],
]);

export const DEFAULT_TILE_DESCRIPTION: TileDescriptionInfo = {
    playerName: 'Nom',
    avatar: '../../../assets/images/game/avatars/centered/bulbasaur.png',
    cost: 4,
    effect: 'test',
};
