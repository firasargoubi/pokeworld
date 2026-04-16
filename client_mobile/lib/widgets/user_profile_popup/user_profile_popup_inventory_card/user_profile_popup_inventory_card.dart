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
  final PreferencesService _preferencesService = PreferencesService();

  late Future<List<ShopItem>> _musicItemsFuture;
  late Future<List<ShopItem>> _buttonItemsFuture;
  late Future<List<ShopItem>> _pokemonItemsFuture;
  ShopItem? _selectedItem;

  @override
  void initState() {
    super.initState();
    _musicItemsFuture = _loadInventoryItemsByType(ShopItemType.music);
    _buttonItemsFuture = _loadInventoryItemsByType(ShopItemType.button);
    _pokemonItemsFuture = _loadInventoryItemsByType(ShopItemType.pokemon);
    _buttonItemsFuture.then((items) {
      if (_selectedItem == null && items.isNotEmpty) {
        _onItemSelected(items.first);
      }
    });
  }

  @override
  void dispose() {
    AudioService().playBackgroundMusic(_preferencesService.getEquippedMenuMusicPath());
    super.dispose();
  }

  Future<List<ShopItem>> _loadInventoryItemsByType(ShopItemType type) async {
    final allShopItems = await _balanceService.getShopItems();
    final inventory = _userService.currentUser.value?.inventory ?? [];
    final ownedIds = inventory.map((item) => item.itemId).toSet();
    List<ShopItem> ownedItems = allShopItems.where((item) => ownedIds.contains(item.id) && item.type == type).toList();
    if (type == ShopItemType.music) {
      const defaultMusicItem = ShopItem(
        id: DEFAULT_MUSIC_ITEM_ID,
        nameKey: 'components.shopPopup.items.menuMusic0',
        price: 0,
        type: ShopItemType.music,
        variant: '0',
      );
      ownedItems = [defaultMusicItem, ...ownedItems];
    }
    if (type == ShopItemType.button) {
      const defaultButtonItem = ShopItem(
        id: 'poke-button-0',
        nameKey: 'components.shopPopup.items.partyBall0',
        price: 0,
        type: ShopItemType.button,
        variant: '0',
      );
      if (!ownedItems.any((item) => item.id == 'poke-button-0')) {
        ownedItems = [defaultButtonItem, ...ownedItems];
      }
    }
    return ownedItems;
  }

  void _onItemSelected(ShopItem item) {
    setState(() {
      _selectedItem = item;
    });
    if (item.type == ShopItemType.music) {
      final musicPath = MUSIC_ITEM_TO_PATH[item.id];
      if (musicPath != null) {
        AudioService().playBackgroundMusic(musicPath);
      }
    } else {
      AudioService().playBackgroundMusic(_preferencesService.getEquippedMenuMusicPath());
    }
  }

  Future<void> _onEquip(ShopItem item) async {
    if (item.type == ShopItemType.music) {
      final newId = item.id == DEFAULT_MUSIC_ITEM_ID ? null : item.id;
      await _preferencesService.setEquippedMusic(newId);
      final audioService = AudioService();
      await audioService.stopAllAudio();
      final musicPath = _preferencesService.getEquippedMenuMusicPath();
      await audioService.playBackgroundMusic(musicPath, transitionDuration: Duration.zero);
    } else if (item.type == ShopItemType.button) {
      final newId = item.id == 'poke-button-0' ? null : item.id;
      await _preferencesService.setEquippedButton(newId);
    }
    if (mounted) setState(() {});
  }

  bool _isEquipped(ShopItem item) {
    if (item.type == ShopItemType.music) {
      if (item.id == DEFAULT_MUSIC_ITEM_ID) return _preferencesService.equippedMusicId == null;
      return _preferencesService.equippedMusicId == item.id;
    }
    if (item.type == ShopItemType.button) {
      if (item.id == 'poke-button-0') return _preferencesService.equippedButtonId == null;
      return _preferencesService.equippedButtonId == item.id;
    }
    return false;
  }

  String _getActionLabel(ShopItem item) {
    if (item.type == ShopItemType.pokemon) return I18nService().translate(INVENTORY_POKEMON_HINT_KEY);
    return _isEquipped(item) ? I18nService().translate(INVENTORY_EQUIPPED_KEY) : I18nService().translate(INVENTORY_EQUIP_KEY);
  }

  @override
  Widget build(BuildContext context) {
    final double baseSize = widget.baseSize;

    return Padding(
      padding: EdgeInsets.only(top: baseSize * 0.035),
      child: Column(
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
                      children: [
                        _InventoryItems(
                          baseSize: baseSize,
                          itemsFuture: _buttonItemsFuture,
                          selectedItem: _selectedItem,
                          onItemSelected: _onItemSelected,
                          isEquipped: _isEquipped,
                          sectionLabel: shop_popup.TYPE_BUTTON_LABEL_TEXT,
                        ),
                        _InventoryItems(
                          baseSize: baseSize,
                          itemsFuture: _musicItemsFuture,
                          selectedItem: _selectedItem,
                          onItemSelected: _onItemSelected,
                          isEquipped: _isEquipped,
                          sectionLabel: shop_popup.TYPE_MUSIC_LABEL_TEXT,
                        ),
                        _InventoryItems(
                          baseSize: baseSize,
                          itemsFuture: _pokemonItemsFuture,
                          selectedItem: _selectedItem,
                          onItemSelected: _onItemSelected,
                          isEquipped: _isEquipped,
                          sectionLabel: shop_popup.TYPE_POKEMON_LABEL_TEXT,
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
                          height: baseSize * 0.22,
                          child: Container(
                            decoration: const BoxDecoration(
                              image: DecorationImage(
                                image: AssetImage(ASSET_INVENTORY_MAIN_ITEM_CONTAINER),
                                fit: BoxFit.fill,
                                filterQuality: FilterQuality.none,
                              ),
                            ),
                            child: Image.asset(
                              _selectedItem != null ? shop_popup.getShopItemImagePath(_selectedItem!) : ASSET_INVENTORY_ITEM_PLACEHOLDER,
                              fit: BoxFit.contain,
                              filterQuality: FilterQuality.none,
                            ),
                          ),
                        ),
                        SizedBox(
                          width: baseSize * 0.25,
                          height: baseSize * 0.23,
                          child: Container(
                            decoration: const BoxDecoration(
                              image: DecorationImage(
                                image: AssetImage(ASSET_INVENTORY_MAIN_ITEM_CONTAINER),
                                fit: BoxFit.fill,
                                filterQuality: FilterQuality.none,
                              ),
                            ),
                            child: Padding(
                              padding: EdgeInsets.all(baseSize * 0.02),
                              child: Text(
                                _selectedItem != null ? I18nService().translate(shop_popup.getItemDescriptionKey(_selectedItem!)) : '',
                                style: INVENTORY_DESCRIPTION_TEXT_STYLE(baseSize * 0.022),
                              ),
                            ),
                          ),
                        ),
                        if (_selectedItem != null)
                          SizedBox(
                            width: baseSize * 0.25,
                            height: baseSize * 0.08,
                            child: _selectedItem!.type == ShopItemType.pokemon
                                ? Center(
                                    child: Text(
                                      I18nService().translate(INVENTORY_POKEMON_HINT_KEY),
                                      style: TextStyle(
                                        color: INVENTORY_DEFAULT_TEXT_COLOR,
                                        fontSize: baseSize * 0.022,
                                        fontFamily: INVENTORY_PIXEL_FONT_FAMILY,
                                        height: 1,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  )
                                : EdgeBodyButton(
                                    leftEdgePath: ASSET_BUTTON_EDGE_1,
                                    rightEdgePath: ASSET_BUTTON_EDGE_2,
                                    bodyPath: ASSET_BUTTON_BODY,
                                    onAction: () => _onEquip(_selectedItem!),
                                    child: Text(
                                      _getActionLabel(_selectedItem!),
                                      style: INVENTORY_DEFAULT_TEXT_STYLE(baseSize * 0.04),
                                      textAlign: TextAlign.center,
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
                      height: double.infinity,
                      child: ColoredBox(
                        color: INVENTORY_BALANCE_BACKGROUND_COLOR,
                        child: Padding(
                          padding: EdgeInsets.symmetric(horizontal: baseSize * 0.02),
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
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InventoryItems extends StatelessWidget {
  const _InventoryItems({
    required this.baseSize,
    required this.itemsFuture,
    required this.selectedItem,
    required this.onItemSelected,
    required this.isEquipped,
    required this.sectionLabel,
  });

  final Future<List<ShopItem>> itemsFuture;
  final double baseSize;
  final ShopItem? selectedItem;
  final ValueChanged<ShopItem> onItemSelected;
  final bool Function(ShopItem) isEquipped;
  final String sectionLabel;

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
          spacing: baseSize * 0.01,
          children: [
            Padding(
              padding: EdgeInsets.only(left: baseSize * 0.01),
              child: Align(
                heightFactor: 0.6,
                alignment: Alignment.centerLeft,
                child: Text(I18nService().translate(sectionLabel), style: INVENTORY_DEFAULT_TEXT_STYLE(baseSize * 0.045)),
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
                  children: items
                      .map(
                        (item) => _InventoryItemTile(
                          baseSize: baseSize,
                          shopItem: item,
                          isSelected: selectedItem?.id == item.id,
                          isEquipped: isEquipped(item),
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
  const _InventoryItemTile({required this.baseSize, required this.shopItem, required this.isSelected, required this.isEquipped, this.onTap});

  final ShopItem shopItem;
  final double baseSize;
  final bool isSelected;
  final bool isEquipped;
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
                    flex: 4,
                    child: Padding(
                      padding: EdgeInsets.only(top: tileSize * 0.12),
                      child: SizedBox.expand(
                        child: Image.asset(shop_popup.getShopItemImagePath(shopItem), fit: BoxFit.contain, filterQuality: FilterQuality.none),
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Stack(
                      alignment: Alignment.topCenter,
                      children: [
                        Text(
                          I18nService().translate(shopItem.nameKey),
                          style: INVENTORY_OUTLINE_TEXT_STYLE(tileSize * 0.12),
                          textAlign: TextAlign.center,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          I18nService().translate(shopItem.nameKey),
                          style: INVENTORY_DEFAULT_TEXT_STYLE(tileSize * 0.12),
                          textAlign: TextAlign.center,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (isEquipped)
              Positioned(
                top: tileSize * 0.08,
                right: tileSize * 0.08,
                width: tileSize * 0.22,
                height: tileSize * 0.22,
                child: Image.asset(ASSET_INVENTORY_ITEM_EQUIPPED_ICON, fit: BoxFit.contain, filterQuality: FilterQuality.none),
              ),
          ],
        ),
      ),
    );
  }
}
