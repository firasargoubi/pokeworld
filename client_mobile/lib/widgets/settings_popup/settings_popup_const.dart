import 'package:flutter/material.dart';

const double DESIGN_ASPECT_RATIO = 2000 / 1300;

const String CONTAINER_ASSET = 'assets/images/menu/containers/settings/gray.png';

const String FONT_FAMILY = 'Pixel';
const Color SHADOW_COLOR = Color.fromARGB(255, 100, 100, 100);

const String TITLE_TEXT = 'components.appSettings.title';
const String MUSIC_LABEL = 'components.appSettings.music';
const String EFFECTS_LABEL = 'components.appSettings.effects';
const String CLOSE_BUTTON_TEXT = 'components.appSettings.close';

// Tab labels
const String AUDIO_TAB_LABEL = 'components.appSettings.audio';
const String PREFERENCES_TAB_LABEL = 'components.appSettings.preferences';

// Preferences labels
const String LANGUAGE_LABEL = 'components.appSettings.language';
const String LANGUAGE_FR_LABEL = 'components.appSettings.languageFr';
const String LANGUAGE_EN_LABEL = 'components.appSettings.languageEn';
const String THEME_LABEL = 'components.appSettings.theme';
const String THEME_DEFAULT_LABEL = 'components.appSettings.themeDefault';
const String THEME_DARK_LABEL = 'components.appSettings.themeDark';

const double OVERLAY_ALPHA = 0.5;
const double BLUR_SIGMA = 2.0;

// Slider constants
const Color SLIDER_TRACK_COLOR = Color(0xFF606060);
const Color SLIDER_FILL_COLOR = Color(0xFF68a0d8);
const Color SLIDER_THUMB_COLOR = Color(0xFFf0f0f0);
const Color SLIDER_THUMB_BORDER_COLOR = Color(0xFF404040);
const double SLIDER_THUMB_BORDER_WIDTH = 2.0;

// Tab & option button colors
const Color TAB_UNDERLINE_ACTIVE = Color.fromRGBO(255, 255, 255, 0.82);
const Color TAB_UNDERLINE_INACTIVE = Colors.transparent;
const Color OPTION_BUTTON_BG = Color(0x99606080);
const Color OPTION_BUTTON_ACTIVE_BG = Color(0xFF0070C0);
const Color OPTION_BUTTON_BORDER_ACTIVE = Color.fromRGBO(255, 255, 255, 0.82);

enum SettingsTab { audio, preferences }
