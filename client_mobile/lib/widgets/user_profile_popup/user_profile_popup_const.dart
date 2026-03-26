part of 'user_profile_popup.dart';

const double ASPECT_RATIO = 16 / 9;
const Duration CARD_ANIMATION_DURATION = Duration(milliseconds: 750);
const Cubic CARD_ANIMATION_CURVE = Cubic(0.22, 0.61, 0.36, 1);
const double CARD_TILT_ANGLE = -8 * math.pi / 180;

const String MY_ACCOUNT_TITLE = 'components.userPopup.myAccountTitle';
const String ACCOUNT_SETTINGS_TITLE = 'components.userPopup.settingsTitle';
const String FRIENDS_DISPLAY_TITLE = 'components.userPopup.friendsTitle';
const String INVENTORY_DISPLAY_TITLE = 'components.userPopup.inventoryTitle';

const String NAME_LABEL = 'components.userPopup.nameLabel';
const String EMAIL_LABEL = 'components.userPopup.emailLabel';
const String UPDATE_BUTTON_LABEL = 'components.userPopup.update';
const String DELETE_ACCOUNT_BUTTON_LABEL = 'components.userPopup.deleteAccount';

const String USER_POPUP_UNKNOWN_USER = 'components.userPopup.unknownUser';
const String USER_POPUP_UNKNOWN_EMAIL = 'components.userPopup.unknownEmail';
const String USER_POPUP_OLD_PASSWORD_LABEL = 'components.userPopup.oldPassword';
const String USER_POPUP_NEW_PASSWORD_LABEL = 'components.userPopup.newPassword';
const String USER_POPUP_CONFIRM_PASSWORD_PLACEHOLDER = 'components.userPopup.confirmPasswordPlaceholder';
const String USER_POPUP_NEW_USERNAME_LABEL = 'components.userPopup.usernameSectionTitle';
const String USER_POPUP_USERNAME_REQUIRED = 'components.userPopup.usernameRequired';
const String USER_POPUP_USERNAME_UNCHANGED = 'components.userPopup.usernameUnchanged';
const String USER_POPUP_USERNAME_LENGTH = 'popup.usernameLength';
const String USER_POPUP_CONFIRM_USERNAME_CHANGE = 'components.userPopup.confirmUsernameChange';
const String USER_POPUP_LOGOUT = 'components.userPopup.logout';
const String USER_POPUP_DELETE_ACCOUNT_CONFIRMATION = 'components.userPopup.deleteAccountConfirmation';
const String USER_POPUP_REQUIRED_FIELDS_ERROR = 'components.userPopup.requiredFieldsError';
const String USER_POPUP_PASSWORD_MISMATCH = 'components.userPopup.passwordMismatch';
const String USER_POPUP_PASSWORD_UNCHANGED = 'components.userPopup.passwordUnchanged';

const String ASSET_CARD_ICON_BG = 'assets/images/menu/containers/user-card/user-card-icon-bg.png';
const String ASSET_TITLE_ICON = 'assets/images/menu/containers/user-card/title-icon.png';
const String ASSET_AVATAR_CONTAINER = 'assets/images/menu/containers/user-card/avatar-container.png';
const String ASSET_BADGES_CONTAINER = 'assets/images/menu/containers/user-card/badges-container.png';
const String ASSET_BADGE_CONTAINER = 'assets/images/menu/containers/user-card/badge-container.png';
const String ASSET_DEFAULT_AVATAR = 'assets/images/menu/fullAvatars/fullAvatar0.png';

const String ASSET_BUTTON_EDGE_1 = 'assets/images/menu/containers/user-card/button-container-edge-1.png';
const String ASSET_BUTTON_EDGE_2 = 'assets/images/menu/containers/user-card/button-container-edge-2.png';
const String ASSET_BUTTON_BODY = 'assets/images/menu/containers/user-card/button-container-body.png';

const String ASSET_SUB_CONTAINER_EDGE_1 = 'assets/images/menu/containers/user-card/sub-container-edge-1.png';
const String ASSET_SUB_CONTAINER_EDGE_2 = 'assets/images/menu/containers/user-card/sub-container-edge-2.png';
const String ASSET_SUB_CONTAINER_BODY = 'assets/images/menu/containers/user-card/sub-container-body.png';

const String ASSET_DELETE_BUTTON_EDGE_1 = 'assets/images/menu/containers/user-card/button-delete-edge-1.png';
const String ASSET_DELETE_BUTTON_EDGE_2 = 'assets/images/menu/containers/user-card/button-delete-edge-2.png';
const String ASSET_DELETE_BUTTON_BODY = 'assets/images/menu/containers/user-card/button-delete-body.png';

const String ASSET_ICON_ARCHIVE = 'assets/images/menu/icons/user-card/archive-sharp.png';
const String ASSET_ICON_FRIENDS = 'assets/images/menu/icons/user-card/friends.png';
const String ASSET_ICON_SETTINGS = 'assets/images/menu/icons/user-card/settings-cog.png';
const String ASSET_ICON_BACK_ARROW = 'assets/images/menu/icons/user-card/back-arrow.png';
const String ASSET_ICON_LOGOUT = 'assets/images/menu/icons/user-card/logout.png';
const String ASSET_ICON_TRASH = 'assets/images/menu/icons/user-card/trash.png';

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
