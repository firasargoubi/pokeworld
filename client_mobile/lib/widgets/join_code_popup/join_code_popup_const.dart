import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

const String JOIN_CODE_POPUP_CONTAINER_ASSET = 'assets/images/menu/containers/join/blue-container.png';

const String JOIN_CODE_POPUP_FONT_FAMILY = 'Pixel';

const Color JOIN_CODE_POPUP_SHADOW_COLOR = Color(0xFF787878);

const String JOIN_CODE_POPUP_TITLE_TEXT = 'pages.join.title';
const String JOIN_CODE_POPUP_HINT_TEXT = 'pages.join.pressEnter';
const int JOIN_PAGE_CODE_LENGTH = 4;

const String VALIDATE_KEY = 'components.preMatchSettings.validate';

const String JOIN_CODE_POPUP_MEASURE_TEXT = '0000';
const String JOIN_CODE_POPUP_UNDERLINE_TEXT = '____';

const DefaultContainerConfig BLUE_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: 0.03,
  innerBorderWidthFactor: 0.025,
  separatorHeightFactor: 0.016,
  backgroundRatio: 0.67,
  borderColor: Color(0xFF484860),
  innerBorderBottomRightColor: Color(0xFF2878b0),
  innerBorderTopLeftColor: Color(0xFF80c0d8),
  backgroundTopColor: Color(0xFF3890d8),
  backgroundBottomColor: Color(0xFF80c0d8),
  closeButtonFactor: 0.055,
  closeButtonTopFactor: 1.1,
  closeButtonRightFactor: 1.1,
);
