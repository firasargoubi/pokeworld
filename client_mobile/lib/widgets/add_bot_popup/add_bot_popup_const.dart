import 'package:client_mobile/models/ui.dart';
import 'package:flutter/material.dart';

const double DESIGN_ASPECT_RATIO = 2000 / 1300;

const String CONTAINER_ASSET = 'assets/images/menu/containers/lobby/gray.png';

const String FONT_FAMILY = 'Pixel';
const Color SHADOW_COLOR = Color.fromARGB(255, 100, 100, 100);

// Text Keys
const String TITLE_KEY = 'components.botCreation.title';
const String AGGRESSIVE_KEY = 'components.botCreation.aggressive';
const String DEFENSIVE_KEY = 'components.botCreation.defensive';
const String ADD_BUTTON_KEY = 'components.botCreation.add';

const double OVERLAY_ALPHA = 0.5;
const double BLUR_SIGMA = 2.0;

const GRAY_CONTAINER_CONFIG = DefaultContainerConfig(
  borderWidthFactor: 0.025,
  innerBorderWidthFactor: 0.015,
  separatorHeightFactor: 0.015,
  backgroundRatio: 0.65,
  borderColor: Color(0xFF484860),
  innerBorderBottomRightColor: Color(0xFF616161),
  innerBorderTopLeftColor: Color(0xFFacacac),
  backgroundTopColor: Color(0xFF888888),
  backgroundBottomColor: Color(0xFFacacac),
);
