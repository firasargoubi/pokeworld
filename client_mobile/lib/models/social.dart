enum SocialListTab {
  Search('search'),
  Friends('friends'),
  ReceivedRequests('received_requests'),
  Blocked('blocked');

  final String value;
  const SocialListTab(this.value);

  static SocialListTab fromValue(String? value) {
    return SocialListTab.values.firstWhere((tab) => tab.value == value, orElse: () => SocialListTab.Search);
  }
}

enum RelationshipType {
  None('none'),
  PendingSent('pending_sent'),
  PendingReceived('pending_received'),
  Friend('friend'),
  Blocked('blocked');

  final String value;
  const RelationshipType(this.value);

  static RelationshipType fromValue(String? value) {
    return RelationshipType.values.firstWhere((relation) => relation.value == value, orElse: () => RelationshipType.None);
  }
}

enum SocialAction {
  SendFriendRequest('friend-request'),
  AcceptFriendRequest('friend-request/accept'),
  DeclineFriendRequest('friend-request/reject'),
  RemoveFriend('friend/remove'),
  BlockUser('block'),
  UnblockUser('unblock');

  final String value;
  const SocialAction(this.value);
}

class SocialListUser {
  final String userId;
  final String username;
  final String? profilePicture;
  final String? fullProfilePicture;

  const SocialListUser({required this.userId, required this.username, this.profilePicture, this.fullProfilePicture});

  factory SocialListUser.fromJson(Map<String, dynamic> json) {
    return SocialListUser(
      userId: (json['userId'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      profilePicture: json['profilePicture'] as String?,
      fullProfilePicture: json['fullProfilePicture'] as String?,
    );
  }
}

class SocialListItem {
  final SocialListUser user;
  final RelationshipType relation;

  const SocialListItem({required this.user, required this.relation});

  factory SocialListItem.fromJson(Map<String, dynamic> json) {
    return SocialListItem(
      user: SocialListUser.fromJson(Map<String, dynamic>.from(json['user'] as Map<dynamic, dynamic>? ?? {})),
      relation: RelationshipType.fromValue(json['relation']?.toString()),
    );
  }
}
