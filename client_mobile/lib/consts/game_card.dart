import 'dart:ui';

import 'package:client_mobile/models/game_card_config.dart';

const Map<GameCardColor, GameCardConfig> GAME_CARD_CONFIGS = {
  GameCardColor.Blue: GameCardConfig(
    backgroundImage: 'assets/images/menu/containers/game/blue.png',
    buttonLightColor: Color(0xFF7bcee6),
    buttonMainColor: Color(0xFF4ba6c6),
    buttonDarkColor: Color(0xFF2a7a99),
  ),
  GameCardColor.Green: GameCardConfig(
    backgroundImage: 'assets/images/menu/containers/game/green.png',
    buttonLightColor: Color(0xFFd0f0d0),
    buttonMainColor: Color(0xFF90c890),
    buttonDarkColor: Color(0xFF407540),
  ),
  GameCardColor.Pink: GameCardConfig(
    backgroundImage: 'assets/images/menu/containers/game/pink.png',
    buttonLightColor: Color(0xFFffe1e8),
    buttonMainColor: Color(0xFFe7a383),
    buttonDarkColor: Color(0xFFa85a4f),
  ),
};
