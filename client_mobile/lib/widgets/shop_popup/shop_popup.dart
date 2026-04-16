import 'dart:math' as math;
import 'dart:ui';

import 'package:client_mobile/models/menu_config.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/edge_body_button/edge_body_button.dart';
import 'package:client_mobile/widgets/shop_popup/shop_popup_const.dart';
import 'package:client_mobile/widgets/shop_popup/shop_popup_controller.dart';
import 'package:client_mobile/widgets/shop_popup/shop_popup_widgets.dart';
import 'package:client_mobile/widgets/stat_container/stat_container.dart';
import 'package:flutter/material.dart';

Future<void> showShopPopup(BuildContext context) {
  return showDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: DIALOG_BARRIER_COLOR,
    builder: (_) => BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
      child: const Material(
        type: MaterialType.transparency,
        child: Center(child: ShopPopup()),
      ),
    ),
  );
}

class ShopPopup extends StatefulWidget {
  const ShopPopup({super.key});

  @override
  State<ShopPopup> createState() => _ShopPopupState();
}

class _ShopPopupState extends State<ShopPopup> {
  final ShopPopupController _controller = ShopPopupController();

  @override
  void initState() {
    super.initState();
    _controller.init();
    _controller.addListener(_onControllerChange);
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChange);
    _controller.dispose();
    super.dispose();
  }

  void _onControllerChange() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double keyboardInsetBottom = MediaQuery.of(context).viewInsets.bottom;
        final double availableWidth = constraints.maxWidth;
        final double availableHeight = constraints.maxHeight - keyboardInsetBottom;

        final double popupReferenceWidth;
        final double popupReferenceHeight;

        if (availableWidth / availableHeight > ASPECT_RATIO) {
          popupReferenceHeight = availableHeight;
          popupReferenceWidth = popupReferenceHeight * ASPECT_RATIO;
        } else {
          popupReferenceWidth = availableWidth;
          popupReferenceHeight = popupReferenceWidth / ASPECT_RATIO;
        }

        final double baseSize = math.min(popupReferenceWidth, popupReferenceHeight);
        final double popupHeight = baseSize * 0.9;
        final double popupWidth = baseSize * 1.1;
        final double frameBaseSize = baseSize * 0.09;
        final double backgroundIconTop = baseSize * -0.022;
        final double backgroundIconLeft = baseSize * -0.019;
        final double backgroundIconHeight = baseSize * 0.6;
        final double titleIconSize = baseSize * 0.07;
        final double titleSpacing = baseSize * 0.02;
        final double titleFontSize = baseSize * 0.06;
        final double centerDividerWidth = baseSize * 0.006;
        final double footerHeight = baseSize * 0.07;
        final double footerOverflowWidth = baseSize * 1.06;
        final double footerContainerWidth = baseSize * 12;

        return SizedBox(
          height: popupHeight,
          width: popupWidth,
          child: FramedContainer(
            style: const FramedContainerStyle(
              borderAsset: USER_BORDER_ASSET_PATH,
              border2Asset: USER_SECOND_BORDER_ASSET_PATH,
              edgeAsset: USER_EDGE_ASSET_PATH,
              edge2Asset: USER_SECOND_EDGE_ASSET_PATH,
              stripeColor1: STRIPE_PRIMARY_COLOR,
              stripeColor2: STRIPE_SECONDARY_COLOR,
              cornerSizeFactor: 0.5,
              sideEdgeWidthFactor: 0.9,
              centerStripeSizeFactor: 0.17,
            ),
            baseSize: frameBaseSize,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Positioned(
                  top: backgroundIconTop,
                  left: backgroundIconLeft,
                  child: Image.asset(
                    USER_CARD_ICON_BACKGROUND_ASSET_PATH,
                    height: backgroundIconHeight,
                    fit: BoxFit.contain,
                    filterQuality: FilterQuality.none,
                  ),
                ),
                Column(
                  children: [
                    ShopPopupTitle(iconSize: titleIconSize, spacing: titleSpacing, fontSize: titleFontSize),
                    SizedBox(height: baseSize * 0.02),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            flex: 5,
                            child: SingleChildScrollView(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ShopItems(
                                    baseSize: baseSize,
                                    shopItemsFuture: _controller.shopItemsButtonFuture,
                                    selectedItem: _controller.selectedItem,
                                    onItemSelected: _controller.onItemSelected,
                                    ownedItemIds: _controller.ownedItemIds,
                                    sectionLabel: TYPE_BUTTON_LABEL_TEXT,
                                  ),
                                  ShopItems(
                                    baseSize: baseSize,
                                    shopItemsFuture: _controller.shopItemsMusicFuture,
                                    selectedItem: _controller.selectedItem,
                                    onItemSelected: _controller.onItemSelected,
                                    ownedItemIds: _controller.ownedItemIds,
                                    sectionLabel: TYPE_MUSIC_LABEL_TEXT,
                                  ),
                                  ShopItems(
                                    baseSize: baseSize,
                                    shopItemsFuture: _controller.shopItemsPokemonFuture,
                                    selectedItem: _controller.selectedItem,
                                    onItemSelected: _controller.onItemSelected,
                                    ownedItemIds: _controller.ownedItemIds,
                                    sectionLabel: TYPE_POKEMON_LABEL_TEXT,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            width: centerDividerWidth,
                            height: double.infinity,
                            child: const ColoredBox(color: CENTER_DIVIDER_COLOR),
                          ),
                          Expanded(
                            flex: 2,
                            child: Padding(
                              padding: EdgeInsets.only(left: baseSize * 0.02),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                spacing: baseSize * 0.02,
                                children: [
                                  SizedBox(
                                    width: baseSize * 0.25,
                                    height: baseSize * 0.25,
                                    child: Container(
                                      decoration: const BoxDecoration(
                                        image: DecorationImage(
                                          image: AssetImage(MAIN_ITEM_CONTAINER_ASSET_PATH),
                                          fit: BoxFit.contain,
                                          filterQuality: FilterQuality.none,
                                        ),
                                      ),
                                      child: Image.asset(
                                        _controller.selectedItem != null
                                            ? getShopItemImagePath(_controller.selectedItem!)
                                            : ITEM_PLACEHOLDER_ASSET_PATH,
                                        fit: BoxFit.contain,
                                        filterQuality: FilterQuality.none,
                                      ),
                                    ),
                                  ),
                                  SizedBox(
                                    width: baseSize * 0.25,
                                    height: baseSize * 0.25,
                                    child: Container(
                                      decoration: const BoxDecoration(
                                        image: DecorationImage(
                                          image: AssetImage(MAIN_ITEM_CONTAINER_ASSET_PATH),
                                          fit: BoxFit.fill,
                                          filterQuality: FilterQuality.none,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: EdgeInsets.all(baseSize * 0.02),
                                        child: Text(
                                          _controller.selectedItem != null
                                              ? I18nService().translate(getItemDescriptionKey(_controller.selectedItem!))
                                              : I18nService().translate(DESCRIPTION_TEXT),
                                          style: buildDefaultTextStyle(baseSize * 0.024),
                                        ),
                                      ),
                                    ),
                                  ),
                                  SizedBox(
                                    width: baseSize * 0.25,
                                    height: baseSize * 0.08,
                                    child: ColorFiltered(
                                      colorFilter: _controller.selectedItem != null && _controller.ownedItemIds.contains(_controller.selectedItem!.id)
                                          ? GRAYSCALE_COLOR_FILTER
                                          : TRANSPARENT_COLOR_FILTER,
                                      child: EdgeBodyButton(
                                        leftEdgePath: BUTTON_EDGE_LEFT_ASSET_PATH,
                                        rightEdgePath: BUTTON_EDGE_RIGHT_ASSET_PATH,
                                        bodyPath: BUTTON_BODY_ASSET_PATH,
                                        onAction: _controller.selectedItem != null && !_controller.ownedItemIds.contains(_controller.selectedItem!.id)
                                            ? _controller.onBuy
                                            : null,
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          crossAxisAlignment: CrossAxisAlignment.center,
                                          children: [
                                            Text(
                                              _controller.selectedItem != null && _controller.ownedItemIds.contains(_controller.selectedItem!.id)
                                                  ? I18nService().translate(OWNED_TEXT)
                                                  : I18nService().translate(BUY_TEXT),
                                              style: buildDefaultTextStyle(baseSize * 0.05),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: footerHeight,
                      child: OverflowBox(
                        maxWidth: footerOverflowWidth,
                        alignment: Alignment.topCenter,
                        child: Container(
                          margin: const EdgeInsets.only(top: 4),
                          width: footerContainerWidth,
                          decoration: const BoxDecoration(
                            image: DecorationImage(
                              image: AssetImage(BADGES_CONTAINER_ASSET_PATH),
                              fit: BoxFit.fill,
                              filterQuality: FilterQuality.none,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              SizedBox(
                                height: double.infinity,
                                child: ColoredBox(
                                  color: BALANCE_BACKGROUND_COLOR,
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(horizontal: baseSize * 0.02),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      crossAxisAlignment: CrossAxisAlignment.center,
                                      children: [
                                        Text(
                                          '${I18nService().translate(BALANCE_TEXT)} ${_controller.currentBalance} \$',
                                          style: buildDefaultTextStyle(baseSize * 0.035),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
