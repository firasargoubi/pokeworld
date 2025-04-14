/* eslint-disable @typescript-eslint/no-magic-numbers */
// Magic numbers are used to define the maximum number of items for each map size

import { ItemType } from '@common/interfaces/item-type.enum';
import { MapSize } from '@common/interfaces/map-data';

export const ITEM_DESCRIPTION: Map<ItemType, string> = new Map([
    [ItemType.Item1, "<b>Shiny Charm:</b> +1 ATT / +1 DEF<br>Ajoute un point d'attaque et de défense au joueur qui le ramasse."],
    [ItemType.Item2, "<b>Evo Gem:</b> +2 ATT / +2 DEF<br>Ajoute deux points d'attaque et de défense au joueur."],
    [ItemType.Item3, "<b>Bush Boost:</b> +3 ATT en buisson<br>Donne un bonus d'attaque supplémentaire quand le joueur est caché dans les buissons."],
    [ItemType.Item4, '<b>Healing Berry:</b> +1 HP/tour si PV ≤ 50%<br>Régénère 1 point de vie par tour quand la santé du joueur est faible.'],
    [
        ItemType.Item5,
        "<b>PokeBall:</b> +30% évasion, +1 nb esquive<br>Augmente les chances d'esquiver et permet d'esquiver une attaque supplémentaire.",
    ],
    [
        ItemType.Item6,
        '<b>Invisibility Mantle:</b> Joueur invisible temporairement<br>Rend le joueur invisible aux yeux des autres pendant un court moment.',
    ],
    [ItemType.Random, "<b>Item Aléatoire:</b> Effet surprise<br>Donne aléatoirement l'un des six objets lors de la collecte."],
    [ItemType.Spawn, '<b>Point de départ:</b> Zone de spawn<br>Endroit où les joueurs apparaissent en début de partie ou après avoir été éliminés.'],
    [ItemType.Flag, "<b>Drapeau:</b> Objectif Capture the Flag<br>L'objectif principal à capturer dans le mode de jeu CTF."],
]);

export const MAX_ITEM_COUNT: Record<MapSize, Record<ItemType, number>> = {
    [MapSize.Small]: {
        [ItemType.Item1]: 1,
        [ItemType.Item2]: 1,
        [ItemType.Item3]: 1,
        [ItemType.Item4]: 1,
        [ItemType.Item5]: 1,
        [ItemType.Item6]: 1,
        [ItemType.Random]: 2,
        [ItemType.Spawn]: 2,
        [ItemType.Flag]: 0,
    },
    [MapSize.Medium]: {
        [ItemType.Item1]: 1,
        [ItemType.Item2]: 1,
        [ItemType.Item3]: 1,
        [ItemType.Item4]: 1,
        [ItemType.Item5]: 1,
        [ItemType.Item6]: 1,
        [ItemType.Random]: 4,
        [ItemType.Spawn]: 4,
        [ItemType.Flag]: 0,
    },
    [MapSize.Large]: {
        [ItemType.Item1]: 1,
        [ItemType.Item2]: 1,
        [ItemType.Item3]: 1,
        [ItemType.Item4]: 1,
        [ItemType.Item5]: 1,
        [ItemType.Item6]: 1,
        [ItemType.Random]: 6,
        [ItemType.Spawn]: 6,
        [ItemType.Flag]: 0,
    },
};
