part of '../user_profile_popup.dart';

class _InventoryCardFace extends StatefulWidget {
  const _InventoryCardFace({required this.baseSize, required this.onBackToFront});

  final double baseSize;
  final VoidCallback onBackToFront;

  @override
  State<_InventoryCardFace> createState() => _InventoryCardFaceState();
}

class _InventoryCardFaceState extends State<_InventoryCardFace> {
  final BalanceService _balanceService = BalanceService();
  final UserService _userService = UserService();

  late Future<List<ShopItem>> _inventoryItemsFuture;
  ShopItem? _selectedItem;

  @override
  void initState() {
    super.initState();
    _inventoryItemsFuture = _loadInventoryItems();
  }

  Future<List<ShopItem>> _loadInventoryItems() async {
    final allShopItems = await _balanceService.getShopItems();
    final inventory = _userService.currentUser.value?.inventory ?? [];
    final ownedIds = inventory.map((item) => item.itemId).toSet();
    return allShopItems.where((item) => ownedIds.contains(item.id)).toList();
  }

  void _onItemSelected(ShopItem item) {
    setState(() {
      _selectedItem = item;
    });
  }

  @override
  Widget build(BuildContext context) {
    final double baseSize = widget.baseSize;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              flex: 2,
              child: _CardTitleRow(title: I18nService().translate(INVENTORY_DISPLAY_TITLE), baseSize: baseSize),
            ),
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  _CardActionButton(icon: Icons.settings, onPressed: widget.onBackToFront, baseSize: baseSize, assetPath: ASSET_ICON_BACK_ARROW),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: baseSize * 0.02),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 5,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    spacing: baseSize * 0.02,
                    children: [
                      _InventoryItems(
                        baseSize: baseSize,
                        itemsFuture: _inventoryItemsFuture,
                        selectedItem: _selectedItem,
                        onItemSelected: _onItemSelected,
                      ),
                      _InventoryItems(
                        baseSize: baseSize,
                        itemsFuture: _inventoryItemsFuture,
                        selectedItem: _selectedItem,
                        onItemSelected: _onItemSelected,
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(
                width: baseSize * 0.006,
                height: double.infinity,
                child: const ColoredBox(color: INVENTORY_CENTER_DIVIDER_COLOR),
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
                              image: AssetImage(ASSET_INVENTORY_MAIN_ITEM_CONTAINER),
                              fit: BoxFit.contain,
                              filterQuality: FilterQuality.none,
                            ),
                          ),
                          child: Image.asset(ASSET_INVENTORY_ITEM_PLACEHOLDER, fit: BoxFit.contain, filterQuality: FilterQuality.none),
                        ),
                      ),
                      SizedBox(
                        width: baseSize * 0.25,
                        height: baseSize * 0.17,
                        child: Container(
                          decoration: const BoxDecoration(
                            image: DecorationImage(
                              image: AssetImage(ASSET_INVENTORY_MAIN_ITEM_CONTAINER),
                              fit: BoxFit.fill,
                              filterQuality: FilterQuality.none,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              _selectedItem != null
                                  ? '${I18nService().translate(_selectedItem!.nameKey)}\n${_selectedItem!.price}$INVENTORY_PRICE_SUFFIX'
                                  : I18nService().translate(INVENTORY_DISPLAY_TITLE),
                              style: INVENTORY_DEFAULT_TEXT_STYLE(baseSize * 0.04),
                              textAlign: TextAlign.center,
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
          height: baseSize * 0.07,
          child: OverflowBox(
            maxWidth: baseSize * 1.06,
            alignment: Alignment.topCenter,
            child: Container(
              margin: const EdgeInsets.only(top: 4),
              width: baseSize * 12,
              decoration: const BoxDecoration(
                image: DecorationImage(image: AssetImage(ASSET_BADGES_CONTAINER), fit: BoxFit.fill, filterQuality: FilterQuality.none),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(
                    width: baseSize * 0.32,
                    height: double.infinity,
                    child: ColoredBox(
                      color: INVENTORY_BALANCE_BACKGROUND_COLOR,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            '${I18nService().translate(BALANCE_LABEL)} ${_userService.currentUser.value?.balance ?? 0}$INVENTORY_PRICE_SUFFIX',
                            style: INVENTORY_DEFAULT_TEXT_STYLE(baseSize * 0.035),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _InventoryItems extends StatelessWidget {
  const _InventoryItems({required this.baseSize, required this.itemsFuture, required this.selectedItem, required this.onItemSelected});

  final Future<List<ShopItem>> itemsFuture;
  final double baseSize;
  final ShopItem? selectedItem;
  final ValueChanged<ShopItem> onItemSelected;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<ShopItem>>(
      future: itemsFuture,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Text('$INVENTORY_ERROR_PREFIX${snapshot.error}');
        }

        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final List<ShopItem> items = snapshot.data!;

        if (items.isEmpty) {
          return Center(child: Text(I18nService().translate(INVENTORY_DISPLAY_TITLE), style: INVENTORY_DEFAULT_TEXT_STYLE(baseSize * 0.05)));
        }

        return Column(
          spacing: baseSize * 0.02,
          children: [
            Padding(
              padding: EdgeInsets.only(right: baseSize * 0.03),
              child: SizedBox(
                width: double.infinity,
                child: Wrap(
                  alignment: WrapAlignment.start,
                  spacing: baseSize * 0.04,
                  runSpacing: baseSize * 0.03,
                  children: items
                      .map(
                        (item) => _InventoryItemTile(
                          baseSize: baseSize,
                          shopItem: item,
                          isSelected: selectedItem?.id == item.id,
                          onTap: () => onItemSelected(item),
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
            FractionallySizedBox(
              widthFactor: 0.9,
              child: SizedBox(
                height: baseSize * 0.007,
                child: const ColoredBox(color: INVENTORY_CENTER_DIVIDER_COLOR),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _InventoryItemTile extends StatelessWidget {
  const _InventoryItemTile({required this.baseSize, required this.shopItem, required this.isSelected, this.onTap});

  final ShopItem shopItem;
  final double baseSize;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final double tileSize = baseSize * 0.2;
    final String containerAsset = isSelected ? ASSET_INVENTORY_ITEM_CONTAINER_ACTIVE : ASSET_INVENTORY_ITEM_CONTAINER;
    final double bgOpacity = isSelected ? INVENTORY_TILE_SELECTED_OPACITY : INVENTORY_TILE_DEFAULT_OPACITY;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
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
                    flex: 3,
                    child: Padding(
                      padding: EdgeInsets.only(top: tileSize * 0.02),
                      child: SizedBox.expand(
                        child: Image.asset(ASSET_INVENTORY_ITEM_PLACEHOLDER, fit: BoxFit.contain, filterQuality: FilterQuality.none),
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
                              style: INVENTORY_OUTLINE_TEXT_STYLE(tileSize * 0.14),
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              I18nService().translate(shopItem.nameKey),
                              style: INVENTORY_DEFAULT_TEXT_STYLE(tileSize * 0.14),
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            Text(
                              '${shopItem.price}$INVENTORY_PRICE_SUFFIX',
                              style: INVENTORY_OUTLINE_TEXT_STYLE(tileSize * 0.12),
                              textAlign: TextAlign.center,
                            ),
                            Text(
                              '${shopItem.price}$INVENTORY_PRICE_SUFFIX',
                              style: INVENTORY_DEFAULT_TEXT_STYLE(tileSize * 0.12),
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
      ),
    );
  }
}
