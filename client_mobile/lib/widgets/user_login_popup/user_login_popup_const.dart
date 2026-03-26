part of 'user_login_popup.dart';

const double ASPECT_RATIO = 16 / 9;

const double _LOGIN_WIDTH_FACTOR = 0.75;
const double _REGISTER_WIDTH_FACTOR = 1.2;

const String LOGIN_TITLE = 'components.authPopup.loginTitle';
const String REGISTER_TITLE = 'components.authPopup.createAccountTitle';

const String LOGIN_FIELD_USERNAME_KEY = 'components.authPopup.username';
const String LOGIN_FIELD_EMAIL_KEY = 'components.authPopup.email';
const String LOGIN_FIELD_PASSWORD_KEY = 'components.authPopup.password';
const String LOGIN_FIELD_CONFIRM_PASSWORD_KEY = 'components.authPopup.confirmPassword';

const String LOGIN_BUTTON_KEY = 'components.authPopup.loginTitle';
const String LOGIN_POPUP_REGISTER_BUTTON_KEY = 'components.authPopup.createAccountButton';
const String LOGIN_POPUP_SWITCH_TO_REGISTER_KEY = 'components.authPopup.createAccountTitle';
const String LOGIN_POPUP_SWITCH_TO_LOGIN_KEY = 'components.authPopup.loginButton';
const String LOGIN_AVATAR_SECTION_TITLE_KEY = 'components.authPopup.avatar';

const String LANG_KEY_FR = 'components.authPopup.languageFr';
const String LANG_KEY_EN = 'components.authPopup.languageEn';
const String LANG_LABEL_FR = 'fr';
const String LANG_LABEL_EN = 'en';

const String LOGIN_POPUP_PASSWORD_MISMATCH = 'components.authPopup.passwordMismatch';
const String LOGIN_POPUP_AVATAR_REQUIRED_ERROR = 'components.userPopup.avatarRequired';

const Color LOGIN_BORDER_COLOR = Color(0xFFa7dcff);
const Color LOGIN_INPUT_BG_COLOR = Color(0xFFb1e0f4);
const Color LOGIN_INPUT_BORDER_COLOR = Color(0xFF5c93cb);
const Color LOGIN_AVATAR_SELECTED_BORDER_COLOR = Color(0xFFFFD700);

const ColorFilter GRAYSCALE_COLOR_FILTER = ColorFilter.matrix([
  0.2126,
  0.7152,
  0.0722,
  0,
  0,
  0.2126,
  0.7152,
  0.0722,
  0,
  0,
  0.2126,
  0.7152,
  0.0722,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
]);

const String ASSET_CARD_ICON_BG = 'assets/images/menu/containers/user-card/user-card-icon-bg.png';
const String ASSET_TITLE_ICON = 'assets/images/menu/containers/user-card/title-icon.png';

const String ASSET_BUTTON_EDGE_1 = 'assets/images/menu/containers/user-card/button-container-edge-1.png';
const String ASSET_BUTTON_EDGE_2 = 'assets/images/menu/containers/user-card/button-container-edge-2.png';
const String ASSET_BUTTON_BODY = 'assets/images/menu/containers/user-card/button-container-body.png';

const String ASSET_SUB_CONTAINER_EDGE_1 = 'assets/images/menu/containers/user-card/sub-container-edge-1.png';
const String ASSET_SUB_CONTAINER_EDGE_2 = 'assets/images/menu/containers/user-card/sub-container-edge-2.png';
const String ASSET_SUB_CONTAINER_BODY = 'assets/images/menu/containers/user-card/sub-container-body.png';

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
  fontFamily: 'Pixel',
  color: Colors.white,
  fontSize: fontSize,
  decoration: TextDecoration.none,
  height: 0.9,
  shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: Color(0xFF2860a8))],
);

// ignore: non_constant_identifier_names
TextStyle BUTTON_TEXT_STYLE(double fontSize) => TextStyle(
  fontFamily: 'Pixel',
  color: Colors.white,
  fontSize: fontSize,
  decoration: TextDecoration.none,
  height: 0.9,
  shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: Color(0xFFa0a0a0))],
);

// ignore: non_constant_identifier_names
TextStyle LABEL_TEXT_STYLE(double fontSize) => TextStyle(
  fontFamily: 'Pixel',
  color: const Color(0xFF4e5257),
  fontSize: fontSize,
  decoration: TextDecoration.none,
  height: 0.9,
  shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: Color(0xFFa0a0a0))],
);

// ignore: non_constant_identifier_names
TextStyle ERROR_TEXT_STYLE(double fontSize) =>
    TextStyle(fontFamily: 'Pixel', color: const Color(0xFFff4444), fontSize: fontSize, decoration: TextDecoration.none, height: 0.9);
