import 'package:client_mobile/models/shop.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/edge_body_button/edge_body_button.dart';
import 'package:client_mobile/widgets/shop_popup/shop_popup_const.dart';
import 'package:flutter/material.dart';

class ShopPopupTitle extends StatelessWidget {
  const ShopPopupTitle({super.key, required this.iconSize, required this.spacing, required this.fontSize});

  final double iconSize;
  final double spacing;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset(TITLE_ICON_ASSET_PATH, width: iconSize, height: iconSize, fit: BoxFit.contain, filterQuality: FilterQuality.none),
        SizedBox(width: spacing),
        Text(I18nService().translate(SHOP_TITLE_TEXT), style: buildTitleTextStyle(fontSize)),
        SizedBox(width: spacing),
        Image.asset(TITLE_ICON_ASSET_PATH, width: iconSize, height: iconSize, fit: BoxFit.contain, filterQuality: FilterQuality.none),
        Expanded(flex: 1, child: Container()),
        SizedBox(
          width: iconSize * 1.2,
          height: iconSize * 1.2,
          child: EdgeBodyButton(
            leftEdgePath: RED_BUTTON_EDGE_LEFT_ASSET_PATH,
            rightEdgePath: RED_BUTTON_EDGE_RIGHT_ASSET_PATH,
            bodyPath: RED_BUTTON_BODY_ASSET_PATH,
            onAction: () => Navigator.of(context).pop(),
            child: SizedBox.square(
              dimension: iconSize * 0.6,
              child: Image.asset(ASSET_ICON_CLOSE, fit: BoxFit.contain, color: Colors.white, filterQuality: FilterQuality.none),
            ),
          ),
        ),
      ],
    );
  }
}

class ShopItems extends StatelessWidget {
  const ShopItems({
    super.key,
    required this.baseSize,
    required this.shopItemsFuture,
    required this.selectedItem,
    required this.onItemSelected,
    required this.ownedItemIds,
    required this.sectionLabel,
  });

  final Future<List<ShopItem>> shopItemsFuture;
  final double baseSize;
  final ShopItem? selectedItem;
  final ValueChanged<ShopItem> onItemSelected;
  final Set<String> ownedItemIds;
  final String sectionLabel;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<ShopItem>>(
      future: shopItemsFuture,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Text('$ERROR_TEXT_PREFIX${snapshot.error}');
        }

        if (!snapshot.hasData) {
          return const CircularProgressIndicator();
        }

        final List<ShopItem> displayedShopItems = snapshot.data!;

        return Column(
          spacing: baseSize * 0.01,
          children: [
            Padding(
              padding: EdgeInsets.only(left: baseSize * 0.01),
              child: Align(
                heightFactor: 0.8,
                alignment: Alignment.centerLeft,
                child: Text(I18nService().translate(sectionLabel), style: buildDefaultTextStyle(baseSize * 0.045)),
              ),
            ),
            Padding(
              padding: EdgeInsets.only(right: baseSize * 0.03),
              child: SizedBox(
                width: double.infinity,
                child: Wrap(
                  alignment: WrapAlignment.start,
                  spacing: baseSize * 0.04,
                  runSpacing: baseSize * 0.03,
                  children: displayedShopItems
                      .map(
                        (shopItem) => ShopItemTile(
                          baseSize: baseSize,
                          shopItem: shopItem,
                          isSelected: selectedItem?.id == shopItem.id,
                          isOwned: ownedItemIds.contains(shopItem.id),
                          onTap: () => onItemSelected(shopItem),
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
            SizedBox(height: baseSize * 0.01),
            FractionallySizedBox(
              widthFactor: 0.9,
              child: SizedBox(
                height: baseSize * 0.007,
                child: const ColoredBox(color: CENTER_DIVIDER_COLOR),
              ),
            ),
            SizedBox(height: baseSize * 0.0),
          ],
        );
      },
    );
  }
}

class ShopItemTile extends StatelessWidget {
  const ShopItemTile({super.key, required this.baseSize, required this.shopItem, required this.isSelected, required this.isOwned, this.onTap});

  final ShopItem shopItem;
  final double baseSize;
  final bool isSelected;
  final bool isOwned;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final double tileSize = baseSize * 0.2;
    final String containerAsset = isSelected ? ITEM_CONTAINER_ACTIVE_ASSET_PATH : ITEM_CONTAINER_ASSET_PATH;

    final TextDecoration textDecoration = isOwned ? TextDecoration.lineThrough : TextDecoration.none;

    final double bgOpacity = isOwned
        ? TILE_OWNED_OPACITY
        : isSelected
        ? TILE_SELECTED_OPACITY
        : TILE_DEFAULT_OPACITY;

    Widget tile = SizedBox(
      width: tileSize,
      height: tileSize,
      child: Stack(
        children: [
          Positioned.fill(
            child: Opacity(
              opacity: bgOpacity,
              child: Container(
                decoration: BoxDecoration(
                  image: DecorationImage(image: AssetImage(containerAsset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  flex: 4,
                  child: Padding(
                    padding: EdgeInsets.only(top: tileSize * 0.1),
                    child: SizedBox.expand(
                      child: Image.asset(getShopItemImagePath(shopItem), fit: BoxFit.contain, filterQuality: FilterQuality.none),
                    ),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Stack(
                        alignment: Alignment.topCenter,
                        children: [
                          Text(
                            I18nService().translate(shopItem.nameKey),
                            style: buildOutlineTextStyle(tileSize * 0.12, decoration: textDecoration),
                            textAlign: TextAlign.center,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            I18nService().translate(shopItem.nameKey),
                            style: buildTileTextStyle(tileSize * 0.12, decoration: textDecoration),
                            textAlign: TextAlign.center,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Text(
                            isOwned ? I18nService().translate(OWNED_TEXT) : '${shopItem.price}$PRICE_SUFFIX_TEXT',
                            style: buildOutlineTextStyle(tileSize * 0.12),
                            textAlign: TextAlign.center,
                          ),
                          Text(
                            isOwned ? I18nService().translate(OWNED_TEXT) : '${shopItem.price}$PRICE_SUFFIX_TEXT',
                            style: buildDefaultTextStyle(tileSize * 0.12),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );

    if (isOwned) {
      tile = ColorFiltered(colorFilter: OWNED_TILE_COLOR_FILTER, child: tile);
    }

    return GestureDetector(onTap: onTap, child: tile);
  }
}
