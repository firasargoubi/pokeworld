class UserInfo {
  UserInfo({
    required this.username,
    required this.userId,
    required this.email,
    required this.profilePicture,
    required this.balance,
    required this.createdAt,
  });

  String username;
  String userId;
  String email;
  String profilePicture;
  num balance;
  DateTime? createdAt;

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      username: json['username'].toString(),
      userId: json['userId'].toString(),
      email: (json['email'] ?? '').toString(),
      profilePicture: (json['profilePicture'] ?? '').toString(),
      balance: (json['balance'] ?? 0) as num,
      createdAt: json['createdAt'] == null ? null : DateTime.tryParse(json['createdAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'email': email,
      'profilePicture': profilePicture,
      'balance': balance,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
