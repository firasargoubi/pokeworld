import 'dart:ui';

import 'package:client_mobile/models/menu_config.dart';

const Map<MenuCardColor, MenuCardConfig> MENU_CARD_SETUP = {
  MenuCardColor.Blue: MenuCardConfig(
    borderColor: Color(0xFFf87030),
    backgroundTopColor: Color(0xFF78d0e8),
    backgroundBottomColor: Color(0xFFa8e8f8),
    innerBorderBottomRightColor: Color(0xFF48a8c8),
    innerBorderTopLeftColor: Color(0xFFa8e8f8),
    pokemonImage: 'assets/images/menu/pokemons/normal/blastoise.png',
    pokemonWidthFactor: 0.82,
    pokemonHeightFactor: 1.0,
  ),
  MenuCardColor.Orange: MenuCardConfig(
    borderColor: Color(0xFF484860),
    backgroundTopColor: Color(0xFFc06810),
    backgroundBottomColor: Color(0xFFd0a020),
    innerBorderBottomRightColor: Color(0xFFa04800),
    innerBorderTopLeftColor: Color(0xFFd0a020),
    pokemonImage: 'assets/images/menu/pokemons/normal/charizard.png',
    pokemonWidthFactor: 1.0,
    pokemonHeightFactor: 1.0,
  ),
};

const MEMBERS_NAMES = [
  'Mohamed Abdellatif Kallel',
  'Mohamed Omar Zedek',
  'Mathieu Lambert',
  'Souhayl Sejjari',
  'Samer Chebair',
  'Selim Mahjoub',
  'Firas Argoubi',
  'Aziz Maaref',
];

const MEMBERS_CHIBIS = ['cubone', 'magikarp', 'pikachu', 'mew', 'eevee', 'psyduck', 'poliwag', 'vulpix'];
