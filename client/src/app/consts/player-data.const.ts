import { PlayerSelectionVisualData } from '@app/interfaces/player-selection-visual-data';
import { MAX_NAME_LENGTH } from '@common/consts/player-data.const';
import { EMPTY_IMAGE } from './images.const';

export const DEFAULT_PLAYER_SELECTION_VISUAL_DATA: PlayerSelectionVisualData = {
    isHpSelected: true,
    isAttackSelected: true,
    avatarList: [],
    selfAvatarimage: EMPTY_IMAGE,
    isAvatarSelected: false,
    nameMaxLength: MAX_NAME_LENGTH,
};
