import 'dart:ui';

enum GameCardColor { Blue, Green, Pink }

class GameCardConfig {
  final String backgroundImage;
  final Color buttonLightColor;
  final Color buttonMainColor;
  final Color buttonDarkColor;

  const GameCardConfig({required this.backgroundImage, required this.buttonLightColor, required this.buttonMainColor, required this.buttonDarkColor});
}
