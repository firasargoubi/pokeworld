import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

// Ratio
const double DESIGN_ASPECT_RATIO = 2000 / 1400;

// Text
const String HEADER_KEY = 'pages.character.title';
const String START_GAME_KEY = 'pages.character.startGame';

// Colors
const Color OUTER_BORDER_COLOR = Color(0xFF636776);
const Color INNER_BORDER_COLOR = Color(0xFFe9f6f7);
const Color SHADOW_COLOR = Color(0xFF787878);

const Color PSEUDO_PANEL_COLOR = Color(0xFF91de91);
const Color PSEUDO_AVATAR_PLACEHOLDER_COLOR = Color(0xFF4B4B4B);

const Color LEFT_STRIPE_COLOR_1 = Color(0xFF9be6d2);
const Color LEFT_STRIPE_COLOR_2 = Color(0xFFabeeda);

const Color RIGHT_STRIPE_COLOR_1 = Color(0xFFc7a9e5);
const Color RIGHT_STRIPE_COLOR_2 = Color(0xFFae89cc);

// Fonts
const String PIXEL_FONT = 'Pixel';

// Assets
const String SELECT_FRAME_ASSET = 'assets/images/menu/containers/stats/select.png';

const String STAT_PINK_ASSET = 'assets/images/menu/containers/stats/pink.png';
const String STAT_GREEN_ASSET = 'assets/images/menu/containers/stats/green.png';
const String STAT_BLUE_ASSET = 'assets/images/menu/containers/stats/blue.png';
const String STAT_ORANGE_ASSET = 'assets/images/menu/containers/stats/orange.png';

const String HEART_ICON_ASSET = 'assets/images/menu/containers/stats/heart.png';
const String LIGHTNING_ICON_ASSET = 'assets/images/menu/containers/stats/lightning.png';
const String D4_ICON_ASSET = 'assets/images/menu/containers/stats/d4-dice.png';
const String D6_ICON_ASSET = 'assets/images/menu/containers/stats/d6-dice.png';

const String START_GAME_BUTTON_ASSET = 'assets/images/menu/containers/stats/blue-button.png';
const String START_GAME_BUTTON_ACTIVE_ASSET = 'assets/images/menu/containers/stats/blue-button-active.png';

// Stat texts
const String STAT_HP_TOP_KEY = 'pages.character.hpBonus';
const String STAT_VIT_TOP_KEY = 'pages.character.speedBonus';
const String STAT_ATK_TOP_KEY = 'pages.character.attack';
const String STAT_ATK_BOTTOM_KEY = '4/4';
const String STAT_DEF_TOP_KEY = 'pages.character.defense';
const String STAT_DEF_BOTTOM_KEY = '4/4';
const String CHOOSE_AVATAR_WARNING_KEY = 'pages.character.chooseAvatarWarning';

const String STAT_HP_BOTTOM_BASE_KEY = '4/4';
const String STAT_HP_BOTTOM_BOOSTED_KEY = '6/6';
const String STAT_VIT_BOTTOM_BASE_KEY = '4/4';
const String STAT_VIT_BOTTOM_BOOSTED_KEY = '6/6';

// Opacity
const double DISABLED_AVATAR_OPACITY = 0.45;
const double INACTIVE_STAT_OPACITY = 0.55;

const int AVATAR_SELECTION_GRID_COLS = 3;
const int AVATAR_SELECTION_ITEM_COUNT = 12;

const double BORDER_WIDTH_FACTOR = 0.075;
const double INNER_BORDER_WIDTH_FACTOR = 0.045;
const double SEPARATOR_HEIGHT_FACTOR = 0.04;
const double BACKGROUND_RATIO = 0.6;

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

const DefaultContainerConfig GREEN_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: BORDER_WIDTH_FACTOR,
  innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
  separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
  backgroundRatio: BACKGROUND_RATIO,
  borderColor: Color(0xFFf87030),
  innerBorderBottomRightColor: Color(0xFF799564),
  innerBorderTopLeftColor: Color(0xFFceffc6),
  backgroundTopColor: Color(0xFF7dd688),
  backgroundBottomColor: Color(0xFFb3f6a8),
);

const DefaultContainerConfig ORANGE_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: BORDER_WIDTH_FACTOR,
  innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
  separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
  backgroundRatio: BACKGROUND_RATIO,
  borderColor: Color(0xFF484860),
  backgroundTopColor: Color(0xFFc06810),
  backgroundBottomColor: Color(0xFFd0a020),
  innerBorderBottomRightColor: Color(0xFFa04800),
  innerBorderTopLeftColor: Color(0xFFd0a020),
);

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
