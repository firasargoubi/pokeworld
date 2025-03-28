import { Avatar } from '@common/interfaces/player-data';

export interface CharacterVisualData {
    isHpSelected: boolean;
    isAttackSelected: boolean;
    avatarList: AvatarVisualData[];
    selfAvatarimage: string;
    isAvatarSelected: boolean;
    nameMaxLength: number;
}

export interface AvatarVisualData {
    avatar: Avatar;
    name: string;
    image: string;
    isLocked: boolean;
    isSelected: boolean;
}

export const MAIN_AVATAR_COUNT = 12;
