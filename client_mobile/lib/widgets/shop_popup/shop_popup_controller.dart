import 'package:client_mobile/consts/preferences_const.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/shop.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/balance/balance_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/shop_popup/shop_popup_const.dart';
import 'package:flutter/foundation.dart';

class ShopPopupController extends ChangeNotifier {
  final BalanceService _balanceService = BalanceService();
  final UserService _userService = UserService();
  final PopupService _popupService = PopupService();
  final I18nService _i18nService = I18nService();
  final AudioService _audioService = AudioService();
  final PreferencesService _preferencesService = PreferencesService();
  late final String _originalMusicPath;

  late Future<List<ShopItem>> shopItemsMusicFuture;
  late Future<List<ShopItem>> shopItemsButtonFuture;
  late Future<List<ShopItem>> shopItemsPokemonFuture;
  ShopItem? selectedItem;
  bool isLoading = false;

  Set<String> get ownedItemIds {
    final inventory = _userService.currentUser.value?.inventory ?? [];
    return inventory.map((item) => item.itemId).toSet();
  }

  num? get currentBalance => _userService.currentUser.value?.balance;

  void init() {
    _originalMusicPath = _preferencesService.getEquippedMenuMusicPath();
    final allItems = _balanceService.getShopItems();
    shopItemsMusicFuture = allItems.then((items) => items.where((i) => i.type == ShopItemType.music).toList());
    shopItemsButtonFuture = allItems.then((items) => items.where((i) => i.type == ShopItemType.button).toList());
    shopItemsPokemonFuture = allItems.then((items) => items.where((i) => i.type == ShopItemType.pokemon).toList());
    allItems.then((items) {
      if (selectedItem == null && items.isNotEmpty) {
        onItemSelected(items.first);
      }
    });
    _refreshCurrentUser();
  }

  Future<void> _refreshCurrentUser() async {
    final String? userId = _userService.currentUser.value?.userId;
    if (userId == null) {
      return;
    }

    try {
      final user = await _userService.getById(userId);
      _userService.currentUser.value = user;
      notifyListeners();
    } catch (_) {}
  }

  void onItemSelected(ShopItem item) {
    selectedItem = item;
    if (item.type == ShopItemType.music) {
      final musicPath = MUSIC_ITEM_TO_PATH[item.id];
      if (musicPath != null) {
        _audioService.playBackgroundMusic(musicPath);
      }
    } else {
      _audioService.playBackgroundMusic(_originalMusicPath);
    }
    notifyListeners();
  }

  @override
  void dispose() {
    _audioService.playBackgroundMusic(_originalMusicPath);
    super.dispose();
  }

  Future<void> onBuy() async {
    if (selectedItem == null || isLoading) return;
    final user = _userService.currentUser.value;
    if (user == null) return;

    if (ownedItemIds.contains(selectedItem!.id)) return;

    if (user.balance < selectedItem!.price) {
      _popupService.showPopup(PopupMessage(message: _i18nService.translate(INSUFFICIENT_FUNDS_TEXT), hasCloseButton: true));
      return;
    }

    isLoading = true;
    notifyListeners();

    try {
      await _balanceService.purchaseItem(user.userId, selectedItem!.id);
      isLoading = false;
      notifyListeners();
      _popupService.showPopup(
        PopupMessage(
          message: _i18nService.translate(PURCHASE_SUCCESS_TEXT, params: {'itemName': _i18nService.translate(selectedItem!.nameKey)}),
          hasCloseButton: true,
          popupColor: PopupColor.Green,
        ),
      );
    } catch (e) {
      isLoading = false;
      notifyListeners();
      _popupService.showPopup(PopupMessage(message: e.toString(), hasCloseButton: true));
    }
  }
}
