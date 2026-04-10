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
const String BALANCE_LABEL = 'components.userPopup.balanceLabel';
const String UPDATE_BUTTON_LABEL = 'components.userPopup.update';
const String DELETE_ACCOUNT_BUTTON_LABEL = 'components.userPopup.deleteAccount';

const String TUTORIAL_LABEL = 'components.userPopup.tutorial';
const String TUTORIAL_RESET_LABEL = 'components.userPopup.resetTutorial';

const String TUTORIAL_ICON_ASSET = 'assets/images/menu/icons/user-card/tuto.png';
const String RESET_ICON_ASSET = 'assets/images/menu/icons/user-card/reset.png';

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
const String USER_POPUP_SEARCH_PLACEHOLDER = 'components.userPopup.searchPlaceholder';
const String USER_POPUP_NO_USERS_FOUND = 'components.userPopup.noUsersFound';

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

const String ASSET_INVENTORY_ITEM_CONTAINER = 'assets/images/menu/containers/shop/item-container.png';
const String ASSET_INVENTORY_ITEM_CONTAINER_ACTIVE = 'assets/images/menu/containers/shop/item-container-active.png';
const String ASSET_INVENTORY_MAIN_ITEM_CONTAINER = 'assets/images/menu/containers/shop/main-item-container.png';
const String ASSET_INVENTORY_ITEM_PLACEHOLDER = 'assets/images/menu/containers/shop/item1.png';

const String INVENTORY_PRICE_SUFFIX = ' \$';
const String INVENTORY_ERROR_PREFIX = 'Error: ';
const Color INVENTORY_BALANCE_BACKGROUND_COLOR = Color(0xFF80b0e8);
const Color INVENTORY_CENTER_DIVIDER_COLOR = Color.fromARGB(100, 255, 255, 255);
const String INVENTORY_PIXEL_FONT_FAMILY = 'Pixel';
const Color INVENTORY_DEFAULT_TEXT_COLOR = Colors.white;
const double INVENTORY_TILE_SELECTED_OPACITY = 0.9;
const double INVENTORY_TILE_DEFAULT_OPACITY = 0.45;

const String ASSET_ICON_ARCHIVE = 'assets/images/menu/icons/user-card/archive-sharp.png';
const String ASSET_ICON_SEARCH = 'assets/images/menu/icons/user-card/search.svg';
const String ASSET_ICON_BLOCK = 'assets/images/menu/icons/user-card/block.svg';
const String ASSET_ICON_ADD_FRIEND = 'assets/images/menu/icons/user-card/add-friend.svg';
const String ASSET_ICON_REMOVE_FRIEND = 'assets/images/menu/icons/user-card/remove-friend.svg';
const String ASSET_ICON_FRIENDS = 'assets/images/menu/icons/user-card/friends.png';
const String ASSET_ICON_PENDING_INVITATION = 'assets/images/menu/icons/user-card/wait-icon.png';
const String ASSET_ICON_MAIL = 'assets/images/menu/icons/chat/mail.png';
const String ASSET_ICON_SETTINGS = 'assets/images/menu/icons/user-card/settings-cog.png';
const String ASSET_ICON_BACK_ARROW = 'assets/images/menu/icons/user-card/back-arrow.png';
const String ASSET_ICON_LOGOUT = 'assets/images/menu/icons/user-card/logout.png';
const String ASSET_ICON_TRASH = 'assets/images/menu/icons/user-card/trash.png';
const String ASSET_ICON_CLOSE = 'assets/images/menu/icons/close/close.png';

const double FRIENDS_TAB_BUTTON_SIZE_FACTOR = 0.1;
const double FRIENDS_TAB_ICON_SIZE_FACTOR = 0.055;
const double FRIENDS_TAB_GAP_FACTOR = 0.0;
const double FRIENDS_TAB_ACTIVE_SCALE = 0.7;
const double FRIENDS_TAB_ACTIVE_OPACITY = 0.6;
const double FRIENDS_TAB_INACTIVE_DARKEN = 0.5;
const Duration FRIENDS_TAB_ANIMATION_DURATION = Duration(milliseconds: 120);
const Color FRIENDS_TAB_ASSET_ICON_COLOR = Colors.white;
const Color FRIENDS_BLOCKED_TAB_ICON_COLOR = Color(0xFFd85b5b);
const Color FRIENDS_ACTION_UNBLOCK_ICON_COLOR = Color(0xFF73d67c);
const double FRIENDS_SEARCH_BAR_HEIGHT_FACTOR = 0.08;
const double FRIENDS_SEARCH_BAR_PADDING_FACTOR = 0.02;
const double FRIENDS_SEARCH_BAR_BORDER_FACTOR = 0.007;
const double FRIENDS_SEARCH_BAR_ICON_SIZE_FACTOR = 0.045;
const double FRIENDS_SEARCH_BAR_SPACING_FACTOR = 0.015;
const double FRIENDS_SEARCH_INPUT_TEXT_FACTOR = 0.032;
const double FRIENDS_RESULT_ITEM_HEIGHT_FACTOR = 0.12;
const double FRIENDS_RESULT_ITEM_RADIUS_FACTOR = 0.02;
const double FRIENDS_RESULT_ITEM_PADDING_FACTOR = 0.015;
const double FRIENDS_RESULT_AVATAR_RADIUS_FACTOR = 0.03;
const double FRIENDS_RESULT_NAME_TEXT_FACTOR = 0.032;
const double FRIENDS_RESULT_LIST_SPACING_FACTOR = 0.01;
const double FRIENDS_ACTION_BUTTON_SIZE_FACTOR = 0.08;

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
TextStyle INVENTORY_DEFAULT_TEXT_STYLE(double fontSize) =>
    TextStyle(color: INVENTORY_DEFAULT_TEXT_COLOR, fontSize: fontSize, fontFamily: INVENTORY_PIXEL_FONT_FAMILY);

// ignore: non_constant_identifier_names
TextStyle INVENTORY_OUTLINE_TEXT_STYLE(double fontSize) => TextStyle(
  fontSize: fontSize,
  fontFamily: INVENTORY_PIXEL_FONT_FAMILY,
  foreground: Paint()
    ..style = PaintingStyle.stroke
    ..strokeWidth = 2
    ..color = Colors.black,
);
