import 'package:client_mobile/models/menu_config.dart';

const Map<MenuCardColor, MenuCardConfig> MENU_CARD_SETUP = {
  MenuCardColor.Blue: MenuCardConfig(
    backgroundImage: 'assets/images/menu/containers/home-containers/blueContainer.png',
    activeBackgroundImage: 'assets/images/menu/containers/home-containers/blueContainerActive.png',
    pokemonImage: 'assets/images/menu/pokemons/normal/blastoise.png',
    pokemonWidthFactor: 0.82,
    pokemonHeightFactor: 1.0,
  ),
  MenuCardColor.Orange: MenuCardConfig(
    backgroundImage: 'assets/images/menu/containers/home-containers/orangeContainer.png',
    activeBackgroundImage: 'assets/images/menu/containers/home-containers/orangeContainerActive.png',
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
