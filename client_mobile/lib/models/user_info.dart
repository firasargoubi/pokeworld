import 'package:client_mobile/models/shop.dart';
import 'package:client_mobile/models/user_preferences.dart';

class UserInfo {
  UserInfo({
    required this.username,
    required this.userId,
    required this.email,
    required this.profilePicture,
    required this.fullProfilePicture,
    required this.balance,
    required this.inventory,
    required this.createdAt,
    required this.preferences,
  });

  String username;
  String userId;
  String email;
  String profilePicture;
  String fullProfilePicture;
  num balance;
  List<InventoryItem> inventory;
  DateTime? createdAt;
  UserPreferences preferences;

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      username: json['username'].toString(),
      userId: json['userId'].toString(),
      email: (json['email'] ?? '').toString(),
      profilePicture: (json['profilePicture'] ?? '').toString(),
      fullProfilePicture: (json['fullProfilePicture'] ?? '').toString(),
      balance: (json['balance'] ?? 0) as num,
      inventory: (json['inventory'] as List<dynamic>?)?.map((item) => InventoryItem.fromJson(item as Map<String, dynamic>)).toList() ?? [],
      createdAt: json['createdAt'] == null ? null : DateTime.tryParse(json['createdAt'].toString()),
      preferences: UserPreferences.fromJson(json['preferences'] as Map<String, dynamic>?),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'email': email,
      'profilePicture': profilePicture,
      'fullProfilePicture': fullProfilePicture,
      'balance': balance,
      'inventory': inventory.map((item) => item.toJson()).toList(),
      'createdAt': createdAt?.toIso8601String(),
      'preferences': preferences.toJson(),
    };
  }
}
