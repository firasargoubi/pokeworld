import 'package:flutter/material.dart';

const double ASPECT_RATIO = 16 / 9;

const String TITLE_ICON_ASSET_PATH = 'assets/images/menu/containers/shop/title-icon.png';
const String BADGES_CONTAINER_ASSET_PATH = 'assets/images/menu/containers/shop/badges-container.png';
const String USER_BORDER_ASSET_PATH = 'assets/images/menu/containers/shop/shop-border-1.png';
const String USER_SECOND_BORDER_ASSET_PATH = 'assets/images/menu/containers/shop/shop-border-2.png';
const String USER_EDGE_ASSET_PATH = 'assets/images/menu/containers/shop/shop-edge-1.png';
const String USER_SECOND_EDGE_ASSET_PATH = 'assets/images/menu/containers/shop/shop-edge-3.png';
const String USER_CARD_ICON_BACKGROUND_ASSET_PATH = 'assets/images/menu/containers/shop/shop-card-icon-bg.png';
const String ITEM_CONTAINER_ASSET_PATH = 'assets/images/menu/containers/shop/item-container.png';
const String ITEM_CONTAINER_ACTIVE_ASSET_PATH = 'assets/images/menu/containers/shop/item-container-active.png';
const String MAIN_ITEM_CONTAINER_ASSET_PATH = 'assets/images/menu/containers/shop/main-item-container.png';
const String ITEM_PLACEHOLDER_ASSET_PATH = 'assets/images/menu/containers/shop/item1.png';

const String BUTTON_EDGE_LEFT_ASSET_PATH = 'assets/images/menu/containers/shop/button-container-edge-1.png';
const String BUTTON_EDGE_RIGHT_ASSET_PATH = 'assets/images/menu/containers/shop/button-container-edge-2.png';
const String BUTTON_BODY_ASSET_PATH = 'assets/images/menu/containers/shop/button-container-body.png';

const String RED_BUTTON_EDGE_LEFT_ASSET_PATH = 'assets/images/menu/containers/user-card/button-delete-edge-1.png';
const String RED_BUTTON_EDGE_RIGHT_ASSET_PATH = 'assets/images/menu/containers/user-card/button-delete-edge-2.png';
const String RED_BUTTON_BODY_ASSET_PATH = 'assets/images/menu/containers/user-card/button-delete-body.png';

const String ASSET_ICON_CLOSE = 'assets/images/menu/icons/close/close.png';

const String SHOP_TITLE_TEXT = 'components.shopPopup.title';
const String DESCRIPTION_TEXT = 'components.shopPopup.description';
const String BUY_TEXT = 'components.shopPopup.buy';
const String BALANCE_TEXT = 'components.shopPopup.balance';
const String ERROR_TEXT_PREFIX = 'Error: ';
const String PRICE_SUFFIX_TEXT = ' \$';
const String OWNED_TEXT = 'components.shopPopup.owned';
const String INSUFFICIENT_FUNDS_TEXT = 'components.shopPopup.insufficientFunds';
const String PURCHASE_SUCCESS_TEXT = 'components.shopPopup.purchaseSuccess';

const Color BUY_BUTTON_DISABLED_COLOR = Color(0xFF888888);

const String PIXEL_FONT_FAMILY = 'Pixel';

const Color DIALOG_BARRIER_COLOR = Colors.black54;
const Color STRIPE_PRIMARY_COLOR = Color(0xFF1E8F63);
const Color STRIPE_SECONDARY_COLOR = Color(0xFF1E8F63);
const Color CENTER_DIVIDER_COLOR = Color.fromARGB(100, 255, 255, 255);
const Color TITLE_TEXT_COLOR = Colors.white;
const Color TITLE_TEXT_SHADOW_COLOR = Color.fromARGB(255, 18, 82, 57);
const Color DEFAULT_TEXT_COLOR = Colors.white;
const Color BALANCE_BACKGROUND_COLOR = Color(0xFF64BE8C);

const double TILE_OWNED_OPACITY = 0.8;
const double TILE_SELECTED_OPACITY = 0.9;
const double TILE_DEFAULT_OPACITY = 0.45;

const ColorFilter GRAYSCALE_COLOR_FILTER = ColorFilter.matrix(<double>[
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

const ColorFilter TRANSPARENT_COLOR_FILTER = ColorFilter.mode(Colors.transparent, BlendMode.dst);

const ColorFilter OWNED_TILE_COLOR_FILTER = ColorFilter.mode(Color(0x77000000), BlendMode.srcATop);

TextStyle buildTitleTextStyle(double fontSize) {
  return TextStyle(
    fontFamily: PIXEL_FONT_FAMILY,
    color: TITLE_TEXT_COLOR,
    fontSize: fontSize,
    decoration: TextDecoration.none,
    height: 0.9,
    shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: TITLE_TEXT_SHADOW_COLOR)],
  );
}

TextStyle buildDefaultTextStyle(double fontSize) {
  return TextStyle(color: DEFAULT_TEXT_COLOR, fontSize: fontSize, fontFamily: PIXEL_FONT_FAMILY);
}

TextStyle buildOutlineTextStyle(double fontSize, {TextDecoration decoration = TextDecoration.none}) {
  return TextStyle(
    fontSize: fontSize,
    fontFamily: PIXEL_FONT_FAMILY,
    decoration: decoration,
    foreground: Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..color = Colors.black,
  );
}

TextStyle buildTileTextStyle(double fontSize, {TextDecoration decoration = TextDecoration.none}) {
  return TextStyle(color: DEFAULT_TEXT_COLOR, fontSize: fontSize, fontFamily: PIXEL_FONT_FAMILY, decoration: decoration);
}
