import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

// Assets (cards)
const String PLAYER_LEFT_ASSET = 'assets/images/menu/containers/lobby/player-card-left.png';
const String PLAYER_MID_ASSET = 'assets/images/menu/containers/lobby/player-card-body.png';
const String PLAYER_RIGHT_ASSET = 'assets/images/menu/containers/lobby/player-card-right.png';

const String SELF_LEFT_ASSET = 'assets/images/menu/containers/lobby/self-card-left.png';
const String SELF_MID_ASSET = 'assets/images/menu/containers/lobby/self-card-body.png';
const String SELF_RIGHT_ASSET = 'assets/images/menu/containers/lobby/self-card-right.png';

const String BOT_LEFT_ASSET = 'assets/images/menu/containers/lobby/bot-card-left.png';
const String BOT_MID_ASSET = 'assets/images/menu/containers/lobby/bot-card-body.png';
const String BOT_RIGHT_ASSET = 'assets/images/menu/containers/lobby/bot-card-right.png';

// Assets (icons / misc)
const String POKE_BALL_ASSET = 'assets/images/menu/containers/lobby/poke-ball.png';
const String HP_BAR_ASSET = 'assets/images/menu/containers/lobby/hp-bar.png';

const String CROWN_ASSET = 'assets/images/menu/icons/lobby/crown.png';
const String AGGRESSIVE_BOT_ASSET = 'assets/images/menu/icons/lobby/bot-aggressive.png';
const String DEFENSIVE_BOT_ASSET = 'assets/images/menu/icons/lobby/bot-defensive.png';

const String ACTION_BUTTON_ASSET = 'assets/images/menu/containers/lobby/red-button.png';
const String ACTION_BUTTON_PRESSED_ASSET = 'assets/images/menu/containers/lobby/red-button-active.png';
const String ACTION_ICON_ASSET = 'assets/images/menu/icons/lobby/user-minus.png';

// Fallbacks / text
const String FALLBACK_AVATAR_ASSET = 'assets/images/menu/containers/lobby/squirtle.png';
const String INACTIVE_LABEL_KEY = 'components.playerCard.add';

// Ratios / layout factors
const double EDGE_WIDTH_TO_HEIGHT_RATIO = 7 / 48;
const double ACTION_BUTTON_WIDTH_TO_HEIGHT_RATIO = 28 / 57;
const double HP_BAR_WIDTH_TO_HEIGHT_RATIO = 140 / 14;

const double LEFT_MARGIN_FACTOR = 0.5;
const double RIGHT_MARGIN_FACTOR = 0.1;

const double INACTIVE_SHIFT_FACTOR = 6.4;
const double INACTIVE_PRESS_NUDGE_FACTOR = 2.5;

const double INACTIVE_IMAGE_BRIGHTNESS = 0.3;

// Styling
const String PIXEL_FONT = 'Pixel';
const Color SHADOW_COLOR = Color(0xFF787878);

const Color ACTION_ICON_TINT = Color(0xFFFFA844);

const Color INACTIVE_TEXT_COLOR = Color.fromARGB(255, 119, 119, 119);
const Color INACTIVE_TEXT_SHADOW_COLOR = Color(0xFF3F3F3F);

const double BORDER_WIDTH_FACTOR = 0.085;
const double INNER_BORDER_WIDTH_FACTOR = 0.065;
const double SEPARATOR_HEIGHT_FACTOR = 0.065;
const double BACKGROUND_RATIO = 0.65;

const DefaultContainerConfig BLUE_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: BORDER_WIDTH_FACTOR,
  innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
  separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
  backgroundRatio: BACKGROUND_RATIO,
  borderColor: Color(0xFF484860),
  innerBorderBottomRightColor: Color(0xFF2878b0),
  innerBorderTopLeftColor: Color(0xFF80c0d8),
  backgroundTopColor: Color(0xFF3890d8),
  backgroundBottomColor: Color(0xFF80c0d8),
);

const DefaultContainerConfig PINK_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: BORDER_WIDTH_FACTOR,
  innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
  separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
  backgroundRatio: BACKGROUND_RATIO,
  borderColor: Color(0xFFf87030),
  innerBorderBottomRightColor: Color(0xFFe7a383),
  innerBorderTopLeftColor: Color(0xFFffdee4),
  backgroundTopColor: Color(0xFFf7ba93),
  backgroundBottomColor: Color(0xFFf7d1d8),
);

const GRAY_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: BORDER_WIDTH_FACTOR,
  innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
  separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
  backgroundRatio: BACKGROUND_RATIO,
  borderColor: Color(0xFF484860),
  innerBorderBottomRightColor: Color(0xFF616161),
  innerBorderTopLeftColor: Color(0xFFacacac),
  backgroundTopColor: Color(0xFF888888),
  backgroundBottomColor: Color(0xFFacacac),
);
