class UserInfo {
  UserInfo(this.username, this.userId);

  String username;
  String userId;

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(json['username'].toString(), json['userId'].toString());
  }

  Map<String, dynamic> toJson() {
    return {'userId': userId, 'username': username};
  }
}
