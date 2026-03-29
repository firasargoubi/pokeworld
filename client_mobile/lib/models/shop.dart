class ShopItem {
  final String id;
  final String nameKey;
  final int price;

  const ShopItem({required this.id, required this.nameKey, required this.price});

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(id: json['id'] as String, nameKey: json['nameKey'] as String, price: (json['price'] as num).toInt());
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'nameKey': nameKey, 'price': price};
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
