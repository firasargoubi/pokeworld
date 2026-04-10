import 'package:client_mobile/models/menu_config.dart';
import 'package:flutter/material.dart';

const double ASPECT_RATIO = 16 / 9;

const String PIXEL_FONT_FAMILY = 'Pixel';

const String TITLE_LABEL = 'components.tutorial.title';
const String RESET_BUTTON_LABEL = 'components.tutorial.resetTutorial';

const String ASSET_CARD_ICON_BG = 'assets/images/menu/containers/user-card/user-card-icon-bg.png';
const String ASSET_TITLE_ICON = 'assets/images/menu/containers/user-card/title-icon.png';

const String ASSET_BUTTON_EDGE_1 = 'assets/images/menu/containers/user-card/button-container-edge-1.png';
const String ASSET_BUTTON_EDGE_2 = 'assets/images/menu/containers/user-card/button-container-edge-2.png';
const String ASSET_BUTTON_BODY = 'assets/images/menu/containers/user-card/button-container-body.png';

const String ASSET_RED_BUTTON_EDGE_1 = 'assets/images/menu/containers/user-card/button-delete-edge-1.png';
const String ASSET_RED_BUTTON_EDGE_2 = 'assets/images/menu/containers/user-card/button-delete-edge-2.png';
const String ASSET_RED_BUTTON_BODY = 'assets/images/menu/containers/user-card/button-delete-body.png';

const String ASSET_TUTORIAL_ARROW_LEFT = 'assets/images/menu/icons/tutorial/arrow-big-1.png';
const String ASSET_TUTORIAL_ARROW_RIGHT = 'assets/images/menu/icons/tutorial/arrow-big-2.png';
const String ASSET_TUTORIAL_ARROW_RESET = 'assets/images/menu/icons/user-card/reset.png';
const String ASSET_TUTORIAL_CLOSE = 'assets/images/menu/icons/tutorial/close.png';
const String ASSET_PROFESSOR_CHEN = 'assets/images/menu/tutorial/professeur-chen.png';

const Color DIALOG_BARRIER_COLOR = Colors.black54;

const Color IMAGE_INPUT_BG_COLOR = Color.fromARGB(71, 255, 255, 255);
const Color IMAGE_INPUT_BORDER_COLOR = Color.fromARGB(255, 161, 203, 255);

const FramedContainerStyle USER_CARD_STYLE = FramedContainerStyle(
  borderAsset: 'assets/images/menu/containers/user-card/user-border-1.png',
  border2Asset: 'assets/images/menu/containers/user-card/user-border-2.png',
  edgeAsset: 'assets/images/menu/containers/user-card/user-edge-1.png',
  edge2Asset: 'assets/images/menu/containers/user-card/user-edge-3.png',
  stripeColor1: Color(0xFF5090e0),
  stripeColor2: Color(0xFF5090e0),
  cornerSizeFactor: 0.5,
  sideEdgeWidthFactor: 0.9,
  centerStripeSizeFactor: 1,
);

// ignore: non_constant_identifier_names
TextStyle TITLE_TEXT_STYLE(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT_FAMILY,
  color: Colors.white,
  fontSize: fontSize,
  decoration: TextDecoration.none,
  height: 0.9,
  shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: Color(0xFF2860a8))],
);

// ignore: non_constant_identifier_names
TextStyle BUTTON_TEXT_STYLE(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT_FAMILY,
  color: Colors.white,
  fontSize: fontSize,
  decoration: TextDecoration.none,
  height: 0.9,
  shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: Color(0xFFa0a0a0))],
);

// ignore: non_constant_identifier_names
TextStyle LABEL_TEXT_STYLE(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT_FAMILY,
  color: const Color.fromARGB(255, 243, 247, 252),
  fontSize: fontSize,
  decoration: TextDecoration.none,
  height: 1,
  shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: Color(0xFFa0a0a0))],
);

// ignore: non_constant_identifier_names
TextStyle HIGHLIGHT_LABEL_TEXT_STYLE(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT_FAMILY,
  color: const Color.fromARGB(255, 251, 215, 34),
  fontSize: fontSize,
  fontWeight: FontWeight.bold,
  decoration: TextDecoration.none,
  height: 1,
  shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: Color.fromARGB(84, 39, 38, 50))],
);
