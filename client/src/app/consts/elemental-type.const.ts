import { ElementalTypeLabelConfig } from '@app/interfaces/elementary-type-label';
import { ElementalType } from '@common/interfaces/player-data';

export const ELEMENTAL_TYPE_LABEL_CONFIG: Record<ElementalType, ElementalTypeLabelConfig> = {
    [ElementalType.Dragon]: {
        mainColor: '#7038f8',
        lightColor: '#b8a0f8',
        darkColor: '#483890',
        textKey: 'pages.character.elementalType.dragon',
    },
    [ElementalType.Electric]: {
        mainColor: '#f8d030',
        lightColor: '#f8f878',
        darkColor: '#b8a038',
        textKey: 'pages.character.elementalType.electric',
    },
    [ElementalType.Fairy]: {
        mainColor: '#f85888',
        lightColor: '#f8c0b0',
        darkColor: '#906060',
        textKey: 'pages.character.elementalType.fairy',
    },
    [ElementalType.Fire]: {
        mainColor: '#f08030',
        lightColor: '#f8d030',
        darkColor: '#c03028',
        textKey: 'pages.character.elementalType.fire',
    },
    [ElementalType.Grass]: {
        mainColor: '#78c850',
        lightColor: '#c0f860',
        darkColor: '#588040',
        textKey: 'pages.character.elementalType.grass',
    },
    [ElementalType.Ground]: {
        mainColor: '#e0c068',
        lightColor: '#f8f878',
        darkColor: '#886830',
        textKey: 'pages.character.elementalType.ground',
    },
    [ElementalType.Normal]: {
        mainColor: '#a8a878',
        lightColor: '#d8d8c0',
        darkColor: '#705848',
        textKey: 'pages.character.elementalType.normal',
    },
    [ElementalType.Psychic]: {
        mainColor: '#f85888',
        lightColor: '#f8c0b0',
        darkColor: '#906060',
        textKey: 'pages.character.elementalType.psychic',
    },
    [ElementalType.Water]: {
        mainColor: '#6890f0',
        lightColor: '#98d8d8',
        darkColor: '#807870',
        textKey: 'pages.character.elementalType.water',
    },
};

export const ELEMENTAL_TYPE_ICONS: Record<ElementalType, string> = {
    [ElementalType.Dragon]: './assets/images/game/elemental-icons/dragon.png',
    [ElementalType.Electric]: './assets/images/game/elemental-icons/electric.png',
    [ElementalType.Fairy]: './assets/images/game/elemental-icons/fairy.png',
    [ElementalType.Fire]: './assets/images/game/elemental-icons/fire.png',
    [ElementalType.Grass]: './assets/images/game/elemental-icons/grass.png',
    [ElementalType.Ground]: './assets/images/game/elemental-icons/ground.png',
    [ElementalType.Normal]: './assets/images/game/elemental-icons/normal.png',
    [ElementalType.Psychic]: './assets/images/game/elemental-icons/psychic.png',
    [ElementalType.Water]: './assets/images/game/elemental-icons/water.png',
};
