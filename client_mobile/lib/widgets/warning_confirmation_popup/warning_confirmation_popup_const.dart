import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

const double DESIGN_ASPECT_RATIO = 2000 / 1300;

const String WARNING_CONFIRMATION_POPUP_CONFIRM_KEY = 'components.warningConfirmation.confirm';
const String WARNING_CONFIRMATION_POPUP_CANCEL_KEY = 'components.warningConfirmation.cancel';
const String WARNING_CONFIRMATION_POPUP_CLOSE_KEY = 'components.warningConfirmation.close';

const String PIXEL_FONT = 'Pixel';
const Color SHADOW_COLOR = Color(0xFF787878);

const double BORDER_WIDTH_FACTOR = 0.02;
const double INNER_BORDER_WIDTH_FACTOR = 0.01;
const double SEPARATOR_HEIGHT_FACTOR = 0.008;
const double BACKGROUND_RATIO = 0.55;

const DefaultContainerConfig GREEN_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: BORDER_WIDTH_FACTOR,
  innerBorderWidthFactor: INNER_BORDER_WIDTH_FACTOR,
  separatorHeightFactor: SEPARATOR_HEIGHT_FACTOR,
  backgroundRatio: BACKGROUND_RATIO,
  borderColor: Color(0xFF484860),
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

const Color GREEN_BUTTON_DARK_COLOR = Color(0xFFd0f0d0 );
const Color GREEN_BUTTON_MAIN_COLOR = Color(0xFF90c890 );
const Color GREEN_BUTTON_LIGHT_COLOR = Color(0xFF407540 );

const Color RED_BUTTON_DARK_COLOR = Color(0xFFff7b7b );
const Color RED_BUTTON_MAIN_COLOR = Color(0xFFd43a3a);
const Color RED_BUTTON_LIGHT_COLOR = Color(0xFFa01818);
