import 'dart:ui';

import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/elemental_type.dart';

const Map<Avatar, ElementalType> AVATAR_ELEMENT_TYPE_MAP = {
  Avatar.DefaultAvatar: ElementalType.Normal,

  Avatar.Avatar1: ElementalType.Grass,
  Avatar.Avatar2: ElementalType.Water,
  Avatar.Avatar3: ElementalType.Fire,
  Avatar.Avatar4: ElementalType.Electric,
  Avatar.Avatar5: ElementalType.Fairy,
  Avatar.Avatar6: ElementalType.Water,
  Avatar.Avatar7: ElementalType.Fire,
  Avatar.Avatar8: ElementalType.Normal,
  Avatar.Avatar9: ElementalType.Ground,
  Avatar.Avatar10: ElementalType.Water,
  Avatar.Avatar11: ElementalType.Dragon,
  Avatar.Avatar12: ElementalType.Psychic,

  Avatar.Avatar1Shiny: ElementalType.Grass,
  Avatar.Avatar2Shiny: ElementalType.Water,
  Avatar.Avatar3Shiny: ElementalType.Fire,
  Avatar.Avatar4Shiny: ElementalType.Electric,
  Avatar.Avatar5Shiny: ElementalType.Fairy,
  Avatar.Avatar6Shiny: ElementalType.Water,
  Avatar.Avatar7Shiny: ElementalType.Fire,
  Avatar.Avatar8Shiny: ElementalType.Normal,
  Avatar.Avatar9Shiny: ElementalType.Ground,
  Avatar.Avatar10Shiny: ElementalType.Water,
  Avatar.Avatar11Shiny: ElementalType.Dragon,
  Avatar.Avatar12Shiny: ElementalType.Psychic,

  Avatar.Avatar1Evolved: ElementalType.Grass,
  Avatar.Avatar2Evolved: ElementalType.Water,
  Avatar.Avatar3Evolved: ElementalType.Fire,
  Avatar.Avatar4Evolved: ElementalType.Electric,
  Avatar.Avatar5Evolved: ElementalType.Fairy,
  Avatar.Avatar6Evolved: ElementalType.Water,
  Avatar.Avatar7Evolved: ElementalType.Fire,
  Avatar.Avatar8Evolved: ElementalType.Normal,
  Avatar.Avatar9Evolved: ElementalType.Ground,
  Avatar.Avatar10Evolved: ElementalType.Water,
  Avatar.Avatar11Evolved: ElementalType.Dragon,
  Avatar.Avatar12Evolved: ElementalType.Psychic,

  Avatar.Avatar1EvolvedShiny: ElementalType.Grass,
  Avatar.Avatar2EvolvedShiny: ElementalType.Water,
  Avatar.Avatar3EvolvedShiny: ElementalType.Fire,
  Avatar.Avatar4EvolvedShiny: ElementalType.Electric,
  Avatar.Avatar5EvolvedShiny: ElementalType.Fairy,
  Avatar.Avatar6EvolvedShiny: ElementalType.Water,
  Avatar.Avatar7EvolvedShiny: ElementalType.Fire,
  Avatar.Avatar8EvolvedShiny: ElementalType.Normal,
  Avatar.Avatar9EvolvedShiny: ElementalType.Ground,
  Avatar.Avatar10EvolvedShiny: ElementalType.Water,
  Avatar.Avatar11EvolvedShiny: ElementalType.Dragon,
  Avatar.Avatar12EvolvedShiny: ElementalType.Psychic,

  Avatar.MissingNo: ElementalType.Normal,
};

const Map<ElementalType, List<ElementalType>> ELEMENT_TYPE_ADVANTAGES = {
  ElementalType.Grass: [ElementalType.Water, ElementalType.Ground],
  ElementalType.Water: [ElementalType.Fire, ElementalType.Ground],
  ElementalType.Fire: [ElementalType.Grass, ElementalType.Fairy],
  ElementalType.Electric: [ElementalType.Water],
  ElementalType.Normal: [],
  ElementalType.Fairy: [ElementalType.Dragon],
  ElementalType.Ground: [ElementalType.Fire, ElementalType.Electric],
  ElementalType.Dragon: [ElementalType.Dragon],
  ElementalType.Psychic: [],
};

const Map<ElementalType, ElementalTypeLabelConfig> ELEMENTAL_TYPE_LABEL_CONFIG = {
  ElementalType.Dragon: ElementalTypeLabelConfig(
    mainColor: Color(0xFF7038F8),
    lightColor: Color(0xFFB8A0F8),
    darkColor: Color(0xFF483890),
    textKey: 'pages.character.elementalType.dragon',
  ),
  ElementalType.Electric: ElementalTypeLabelConfig(
    mainColor: Color(0xFFF8D030),
    lightColor: Color(0xFFF8F878),
    darkColor: Color(0xFFB8A038),
    textKey: 'pages.character.elementalType.electric',
  ),
  ElementalType.Fairy: ElementalTypeLabelConfig(
    mainColor: Color(0xFFF85888),
    lightColor: Color(0xFFF8C0B0),
    darkColor: Color(0xFF906060),
    textKey: 'pages.character.elementalType.fairy',
  ),
  ElementalType.Fire: ElementalTypeLabelConfig(
    mainColor: Color(0xFFF08030),
    lightColor: Color(0xFFF8D030),
    darkColor: Color(0xFFC03028),
    textKey: 'pages.character.elementalType.fire',
  ),
  ElementalType.Grass: ElementalTypeLabelConfig(
    mainColor: Color(0xFF78C850),
    lightColor: Color(0xFFC0F860),
    darkColor: Color(0xFF588040),
    textKey: 'pages.character.elementalType.grass',
  ),
  ElementalType.Ground: ElementalTypeLabelConfig(
    mainColor: Color(0xFFE0C068),
    lightColor: Color(0xFFF8F878),
    darkColor: Color(0xFF886830),
    textKey: 'pages.character.elementalType.ground',
  ),
  ElementalType.Normal: ElementalTypeLabelConfig(
    mainColor: Color(0xFFA8A878),
    lightColor: Color(0xFFD8D8C0),
    darkColor: Color(0xFF705848),
    textKey: 'pages.character.elementalType.normal',
  ),
  ElementalType.Psychic: ElementalTypeLabelConfig(
    mainColor: Color(0xFFF85888),
    lightColor: Color(0xFFF8C0B0),
    darkColor: Color(0xFF906060),
    textKey: 'pages.character.elementalType.psychic',
  ),
  ElementalType.Water: ElementalTypeLabelConfig(
    mainColor: Color(0xFF6890F0),
    lightColor: Color(0xFF98D8D8),
    darkColor: Color(0xFF807870),
    textKey: 'pages.character.elementalType.water',
  ),
};

const Map<ElementalType, String> ELEMENTAL_TYPE_ICONS = {
  ElementalType.Dragon: 'assets/images/game/elemental-icons/dragon.png',
  ElementalType.Electric: 'assets/images/game/elemental-icons/electric.png',
  ElementalType.Fairy: 'assets/images/game/elemental-icons/fairy.png',
  ElementalType.Fire: 'assets/images/game/elemental-icons/fire.png',
  ElementalType.Grass: 'assets/images/game/elemental-icons/grass.png',
  ElementalType.Ground: 'assets/images/game/elemental-icons/ground.png',
  ElementalType.Normal: 'assets/images/game/elemental-icons/normal.png',
  ElementalType.Psychic: 'assets/images/game/elemental-icons/psychic.png',
  ElementalType.Water: 'assets/images/game/elemental-icons/water.png',
};
