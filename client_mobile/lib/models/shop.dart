enum ShopItemType {
  button('button'),
  music('music'),
  pokemon('pokemon');

  const ShopItemType(this.value);

  final String value;

  static ShopItemType fromValue(String? value) {
    return ShopItemType.values.firstWhere((t) => t.value == value, orElse: () => ShopItemType.button);
  }
}

enum PartyBallVariant {
  zero('0'),
  one('1'),
  two('2'),
  three('3'),
  four('4');

  const PartyBallVariant(this.value);

  final String value;

  static PartyBallVariant? fromValue(String? value) {
    try {
      return PartyBallVariant.values.firstWhere((v) => v.value == value);
    } catch (_) {
      return null;
    }
  }
}

enum MenuMusicVariant {
  zero('0'),
  one('1'),
  two('2'),
  three('3');

  const MenuMusicVariant(this.value);

  final String value;

  static MenuMusicVariant? fromValue(String? value) {
    try {
      return MenuMusicVariant.values.firstWhere((v) => v.value == value);
    } catch (_) {
      return null;
    }
  }
}

class ShopItem {
  final String id;
  final String nameKey;
  final int price;
  final ShopItemType type;
  final String? variant;

  const ShopItem({required this.id, required this.nameKey, required this.price, required this.type, this.variant});

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'] as String,
      nameKey: json['nameKey'] as String,
      price: (json['price'] as num).toInt(),
      type: ShopItemType.fromValue(json['type'] as String?),
      variant: json['variant'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'nameKey': nameKey, 'price': price, 'type': type.value, if (variant != null) 'variant': variant};
  }
}

class InventoryItem {
  final String itemId;
  final int price;

  const InventoryItem({required this.itemId, required this.price});

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(itemId: json['itemId'] as String, price: (json['price'] as num).toInt());
  }

  Map<String, dynamic> toJson() {
    return {'itemId': itemId, 'price': price};
  }
}
