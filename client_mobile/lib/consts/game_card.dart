import 'dart:ui';

import 'package:client_mobile/models/game_card_config.dart';
import 'package:client_mobile/models/ui.dart';

const double BORDER_WIDTH_FACTOR = 0.05;
const double INNER_BORDER_WIDTH_FACTOR = 0.04;
const double SEPARATOR_HEIGHT_FACTOR = 0.03;
const double BACKGROUND_RATIO = 0.67;
const Color BORDER_COLOR = Color(0xFFf87030);

const Map<GameCardColor, GameCardConfig> GAME_CARD_CONFIGS = {
  GameCardColor.Blue: GameCardConfig(
    containerConfig: DefaultContainerConfig(
      borderWidthFactor: BORDER_WIDTH_FACTOR,
      innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
      separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
      backgroundRatio: BACKGROUND_RATIO,
      borderColor: BORDER_COLOR,
      innerBorderBottomRightColor: Color(0xFF4ba6c6),
      innerBorderTopLeftColor: Color(0xFFaae7f7),
      backgroundTopColor: Color(0xFF65aac2),
      backgroundBottomColor: Color(0xFF98d7e8),
    ),
    buttonLightColor: Color(0xFF7bcee6),
    buttonMainColor: Color(0xFF4ba6c6),
    buttonDarkColor: Color(0xFF2a7a99),
  ),
  GameCardColor.Green: GameCardConfig(
    containerConfig: DefaultContainerConfig(
      borderWidthFactor: BORDER_WIDTH_FACTOR,
      innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
      separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
      backgroundRatio: BACKGROUND_RATIO,
      borderColor: BORDER_COLOR,
      innerBorderBottomRightColor: Color(0xFF799564),
      innerBorderTopLeftColor: Color(0xFFceffc6),
      backgroundTopColor: Color(0xFF7dd688),
      backgroundBottomColor: Color(0xFFb3f6a8),
    ),
    buttonLightColor: Color(0xFFd0f0d0),
    buttonMainColor: Color(0xFF90c890),
    buttonDarkColor: Color(0xFF407540),
  ),
  GameCardColor.Pink: GameCardConfig(
    containerConfig: DefaultContainerConfig(
      borderWidthFactor: BORDER_WIDTH_FACTOR,
      innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
      separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
      backgroundRatio: BACKGROUND_RATIO,
      borderColor: BORDER_COLOR,
      innerBorderBottomRightColor: Color(0xFFe7a383),
      innerBorderTopLeftColor: Color(0xFFffdee4),
      backgroundTopColor: Color(0xFFf7ba93),
      backgroundBottomColor: Color(0xFFf7d1d8),
    ),
    buttonLightColor: Color(0xFFffe1e8),
    buttonMainColor: Color(0xFFe7a383),
    buttonDarkColor: Color(0xFFa85a4f),
  ),
};
