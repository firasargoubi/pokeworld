enum GameCardColor { Blue, Green, Pink }

class GameCardConfig {
  final String backgroundImage;
  final String buttonImage;
  final String buttonImageActive;

  const GameCardConfig({required this.backgroundImage, required this.buttonImage, required this.buttonImageActive, required});
}
