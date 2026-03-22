class Owner {
  const Owner({required this.userId, required this.userName});

  final String userId;
  final String userName;

  factory Owner.fromJson(Map<String, dynamic> json) {
    return Owner(userId: json['userId'] as String, userName: json['userName'] as String);
  }

  Map<String, dynamic> toJson() => {'userId': userId, 'userName': userName};
}
