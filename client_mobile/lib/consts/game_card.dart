import 'package:client_mobile/models/game_card_config.dart';

const Map<GameCardColor, GameCardConfig> GAME_CARD_CONFIGS = {
  GameCardColor.blue: GameCardConfig(
    backgroundImage: 'assets/images/menu/containers/game/blue.png',
    buttonImage: 'assets/images/menu/containers/game/blue-button.png',
  ),
  GameCardColor.green: GameCardConfig(
    backgroundImage: 'assets/images/menu/containers/game/green.png',
    buttonImage: 'assets/images/menu/containers/game/green-button.png',
  ),
  GameCardColor.pink: GameCardConfig(
    backgroundImage: 'assets/images/menu/containers/game/pink.png',
    buttonImage: 'assets/images/menu/containers/game/pink-button.png',
  ),
};
