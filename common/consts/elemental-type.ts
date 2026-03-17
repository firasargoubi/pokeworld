import { Avatar, ElementalType } from '../interfaces/player-data';

export const ELEMENT_TYPE_ADVANTAGE_BONUS = 2;

export const AVATAR_ELEMENT_TYPE_MAP: Record<Avatar, ElementalType> = {
    [Avatar.Default]: ElementalType.Normal,

    [Avatar.Avatar1]: ElementalType.Grass,
    [Avatar.Avatar2]: ElementalType.Water,
    [Avatar.Avatar3]: ElementalType.Fire,
    [Avatar.Avatar4]: ElementalType.Electric,
    [Avatar.Avatar5]: ElementalType.Fairy,
    [Avatar.Avatar6]: ElementalType.Water,
    [Avatar.Avatar7]: ElementalType.Fire,
    [Avatar.Avatar8]: ElementalType.Normal,
    [Avatar.Avatar9]: ElementalType.Ground,
    [Avatar.Avatar10]: ElementalType.Water,
    [Avatar.Avatar11]: ElementalType.Dragon,
    [Avatar.Avatar12]: ElementalType.Psychic,

    [Avatar.Avatar1Shiny]: ElementalType.Grass,
    [Avatar.Avatar2Shiny]: ElementalType.Water,
    [Avatar.Avatar3Shiny]: ElementalType.Fire,
    [Avatar.Avatar4Shiny]: ElementalType.Electric,
    [Avatar.Avatar5Shiny]: ElementalType.Fairy,
    [Avatar.Avatar6Shiny]: ElementalType.Water,
    [Avatar.Avatar7Shiny]: ElementalType.Fire,
    [Avatar.Avatar8Shiny]: ElementalType.Normal,
    [Avatar.Avatar9Shiny]: ElementalType.Ground,
    [Avatar.Avatar10Shiny]: ElementalType.Water,
    [Avatar.Avatar11Shiny]: ElementalType.Dragon,
    [Avatar.Avatar12Shiny]: ElementalType.Psychic,

    [Avatar.Avatar1Evolved]: ElementalType.Grass,
    [Avatar.Avatar2Evolved]: ElementalType.Water,
    [Avatar.Avatar3Evolved]: ElementalType.Fire,
    [Avatar.Avatar4Evolved]: ElementalType.Electric,
    [Avatar.Avatar5Evolved]: ElementalType.Fairy,
    [Avatar.Avatar6Evolved]: ElementalType.Water,
    [Avatar.Avatar7Evolved]: ElementalType.Fire,
    [Avatar.Avatar8Evolved]: ElementalType.Normal,
    [Avatar.Avatar9Evolved]: ElementalType.Ground,
    [Avatar.Avatar10Evolved]: ElementalType.Water,
    [Avatar.Avatar11Evolved]: ElementalType.Dragon,
    [Avatar.Avatar12Evolved]: ElementalType.Psychic,

    [Avatar.Avatar1EvolvedShiny]: ElementalType.Grass,
    [Avatar.Avatar2EvolvedShiny]: ElementalType.Water,
    [Avatar.Avatar3EvolvedShiny]: ElementalType.Fire,
    [Avatar.Avatar4EvolvedShiny]: ElementalType.Electric,
    [Avatar.Avatar5EvolvedShiny]: ElementalType.Fairy,
    [Avatar.Avatar6EvolvedShiny]: ElementalType.Water,
    [Avatar.Avatar7EvolvedShiny]: ElementalType.Fire,
    [Avatar.Avatar8EvolvedShiny]: ElementalType.Normal,
    [Avatar.Avatar9EvolvedShiny]: ElementalType.Ground,
    [Avatar.Avatar10EvolvedShiny]: ElementalType.Water,
    [Avatar.Avatar11EvolvedShiny]: ElementalType.Dragon,
    [Avatar.Avatar12EvolvedShiny]: ElementalType.Psychic,

    [Avatar.MissingNo]: ElementalType.Normal,
};

export const ELEMENT_TYPE_ADVANTAGES: Record<ElementalType, ElementalType[]> = {
    [ElementalType.Grass]: [ElementalType.Water, ElementalType.Ground],
    [ElementalType.Water]: [ElementalType.Fire, ElementalType.Ground],
    [ElementalType.Fire]: [ElementalType.Grass, ElementalType.Fairy],
    [ElementalType.Electric]: [ElementalType.Water],
    [ElementalType.Normal]: [],
    [ElementalType.Fairy]: [ElementalType.Dragon],
    [ElementalType.Ground]: [ElementalType.Fire, ElementalType.Electric],
    [ElementalType.Dragon]: [ElementalType.Dragon],
    [ElementalType.Psychic]: [],
};
