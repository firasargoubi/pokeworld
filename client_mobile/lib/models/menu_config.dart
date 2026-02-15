enum MenuCardColor { blue, orange }

class MenuCardConfig {
  final String backgroundImage;
  final String activeBackgroundImage;
  final String pokemonImage;
  final double pokemonWidthFactor;
  final double pokemonHeightFactor;

  const MenuCardConfig({
    required this.backgroundImage,
    required this.activeBackgroundImage,
    required this.pokemonImage,
    required this.pokemonWidthFactor,
    required this.pokemonHeightFactor,
  });
}
