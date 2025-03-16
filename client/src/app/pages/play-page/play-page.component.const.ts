import { EMPTY_IMAGE } from "@app/consts/images.const";
import { PlayVisualData } from "@app/interfaces/play-visual-data";

export const DEFAULT_PLAY_VISUAL_DATA: PlayVisualData = {
    mapSize: '',
    gameMode: '',
    canUseAction: false,
    canEndTurn: false,
    selfIndex: 0,
    currentPlayerCount: 0,
    maxPlayerCount: 0,
    activePlayer: 0,
    players: [],
    selfAvatarUrl: '',
    selfName: '',
    currentMovement: 0,
    maxMovement: 0,
    thumbnailUrl: structuredClone(EMPTY_IMAGE),
};
