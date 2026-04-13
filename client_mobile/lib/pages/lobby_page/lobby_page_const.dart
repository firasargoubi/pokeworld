import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

// Ratio
const double DESIGN_ASPECT_RATIO = 2000 / 1300;

// Text Keys
const String HEADER_KEY = 'pages.lobby.title';
const String LAUNCH_KEY = 'pages.lobby.start';
const String CODE_LABEL_KEY = 'pages.lobby.accessCode';
const String ENTRY_FEE_LABEL_KEY = 'pages.lobby.entryFee';
const String CHALLENGE_TITLE_KEY = 'challenges.title';

// Colors
const Color OUTER_BORDER_COLOR = Color(0xFF636776);
const Color INNER_BORDER_COLOR = Color(0xFFe9f6f7);

const Color STRIPE_COLOR_1 = Color(0xFF93d7eb);
const Color STRIPE_COLOR_2 = Color(0xFFace6f6);

const String PIXEL_FONT = 'Pixel';
const Color SHADOW_COLOR = Color(0xFF787878);

// Assets
const String CODE_CONTAINER_ASSET = 'assets/images/menu/containers/lobby/code.png';

const String LOCK_ICON_ASSET = 'assets/images/menu/icons/lobby/lock.png';
const String UNLOCK_ICON_ASSET = 'assets/images/menu/icons/lobby/unlock.png';
const String COPY_ICON_ASSET = 'assets/images/menu/icons/lobby/copy.png';
const String SETTINGS_ICON_ASSET = 'assets/images/menu/icons/lobby/settings-cog.png';

const String DROP_ICON_ASSET = 'assets/images/menu/icons/lobby/drop.png';
const String ELEMENTAL_ICON_ASSET = 'assets/images/menu/icons/lobby/elemental.png';
const String RAPID_ELIMINATION_ICON_ASSET = 'assets/images/menu/icons/lobby/skull.png';
const String OPEN_ICON_ASSET = 'assets/images/menu/icons/lobby/open.png';
const String FRIEND_ONLY_ICON_ASSET = 'assets/images/menu/icons/user-card/friends.png';

const String BLUE_BUTTON_ASSET = 'assets/images/menu/containers/lobby/blue-button.png';
const String BLUE_BUTTON_ACTIVE_ASSET = 'assets/images/menu/containers/lobby/blue-button-active.png';

const String GREEN_BUTTON_ASSET = 'assets/images/menu/containers/lobby/green-button.png';
const String GREEN_BUTTON_ACTIVE_ASSET = 'assets/images/menu/containers/lobby/green-button-active.png';

const String GRAY_BUTTON_ASSET = 'assets/images/menu/containers/lobby/gray-button.png';
const String GRAY_BUTTON_ACTIVE_ASSET = 'assets/images/menu/containers/lobby/gray-button-active.png';

const DefaultContainerConfig BLUE_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: 0.02,
  innerBorderWidthFactor: 0.015,
  separatorHeightFactor: 0.008,
  backgroundRatio: 0.67,
  borderColor: Color(0xFF484860),
  innerBorderBottomRightColor: Color(0xFF2878b0),
  innerBorderTopLeftColor: Color(0xFF80c0d8),
  backgroundTopColor: Color(0xFF3890d8),
  backgroundBottomColor: Color(0xFF80c0d8),
);

const DefaultContainerConfig GREEN_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: 0.02,
  innerBorderWidthFactor: 0.01,
  separatorHeightFactor: 0.01,
  backgroundRatio: 0.40,
  borderColor: Color(0xFF48485F),
  innerBorderBottomRightColor: Color(0xFF255D38),
  innerBorderTopLeftColor: Color(0xFF48805B),
  backgroundTopColor: Color(0xFF2B6440),
  backgroundBottomColor: Color(0xFF48805B),
);
