import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

const double DESIGN_ASPECT_RATIO = 2000 / 1300;

const String CONTAINER_ASSET = 'assets/images/menu/containers/lobby/gray-2.png';
const String OPEN_ICON_ASSET = 'assets/images/menu/icons/lobby/open.png';
const String FRIEND_ONLY_ICON_ASSET = 'assets/images/menu/icons/user-card/friends.png';

const String FONT_FAMILY = 'Pixel';
const Color SHADOW_COLOR = Color.fromARGB(255, 100, 100, 100);

const String TITLE_KEY = 'components.preMatchSettings.title';
const String ACCESSIBILITY_KEY = 'components.preMatchSettings.accessibility';
const String OPEN_KEY = 'components.preMatchSettings.open';
const String FRIEND_ONLY_KEY = 'components.preMatchSettings.friendOnly';
const String PRICE_KEY = 'components.preMatchSettings.price';
const String NOT_ENOUGH_FUNDS_KEY = 'components.preMatchSettings.notEnoughFunds';
const String VALIDATE_KEY = 'components.preMatchSettings.validate';

const int ENTRY_FEE_STEP = 500;

const double OVERLAY_ALPHA = 0.5;
const double BLUR_SIGMA = 2.0;

const GRAY_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: 0.025,
  innerBorderWidthFactor: 0.015,
  separatorHeightFactor: 0.015,
  backgroundRatio: 0.7,
  borderColor: Color(0xFF484860),
  innerBorderBottomRightColor: Color(0xFF616161),
  innerBorderTopLeftColor: Color(0xFFacacac),
  backgroundTopColor: Color(0xFF888888),
  backgroundBottomColor: Color(0xFFacacac),
  closeButtonFactor: 0.055,
  closeButtonTopFactor: 1.1,
  closeButtonRightFactor: 1.1,
);
