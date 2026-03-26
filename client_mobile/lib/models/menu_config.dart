import 'dart:ui';

enum MenuCardColor { Blue, Orange }

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

class FramedContainerStyle {
  const FramedContainerStyle({
    required this.borderAsset,
    required this.border2Asset,
    required this.edgeAsset,
    required this.edge2Asset,
    required this.stripeColor1,
    required this.stripeColor2,
    required this.cornerSizeFactor,
    required this.sideEdgeWidthFactor,
    required this.centerStripeSizeFactor,
  });

  final String borderAsset;
  final String border2Asset;
  final String edgeAsset;
  final String edge2Asset;

  final Color stripeColor1;
  final Color stripeColor2;

  final double cornerSizeFactor;
  final double sideEdgeWidthFactor;
  final double centerStripeSizeFactor;
}
