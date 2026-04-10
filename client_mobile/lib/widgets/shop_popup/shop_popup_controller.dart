import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/shop.dart';
import 'package:client_mobile/services/balance/balance_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/shop_popup/shop_popup_const.dart';
import 'package:flutter/foundation.dart';

class ShopPopupController extends ChangeNotifier {
  final BalanceService _balanceService = BalanceService();
  final UserService _userService = UserService();
  final PopupService _popupService = PopupService();
  final I18nService _i18nService = I18nService();

  late Future<List<ShopItem>> shopItemsFuture;
  late Future<List<ShopItem>> shopItemsFuture2;
  ShopItem? selectedItem;
  bool isLoading = false;

  Set<String> get ownedItemIds {
    final inventory = _userService.currentUser.value?.inventory ?? [];
    return inventory.map((item) => item.itemId).toSet();
  }

  num? get currentBalance => _userService.currentUser.value?.balance;

  void init() {
    shopItemsFuture = _balanceService.getShopItems();
    shopItemsFuture2 = _balanceService.getShopItems();
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
    notifyListeners();
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
        ),
      );
    } catch (e) {
      isLoading = false;
      notifyListeners();
      _popupService.showPopup(PopupMessage(message: e.toString(), hasCloseButton: true));
    }
  }
}
