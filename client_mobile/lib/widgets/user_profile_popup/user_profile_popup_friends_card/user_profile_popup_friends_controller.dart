import 'package:client_mobile/models/social.dart';
import 'package:client_mobile/services/social_service/social_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:flutter/material.dart';

class FriendsController extends ChangeNotifier {
  final SocialService _socialService = SocialService();
  final UserService _userService = UserService();

  FriendsController() {
    _socialService.activeTab.addListener(_onSocialStateChanged);
    _socialService.isLoading.addListener(_onSocialStateChanged);
    _socialService.relationshipsToDisplay.addListener(_onSocialStateChanged);
    _socialService.searchQuery.addListener(_onSocialStateChanged);

    final String? userId = _userService.currentUser.value?.userId;
    if (userId != null) {
      _socialService.initialize(userId);
    }
  }

  SocialListTab get activeTab => _socialService.activeTab.value;
  bool get isLoading => _socialService.isLoading.value;
  String get searchQuery => _socialService.searchQuery.value;
  List<SocialListItem> get relationshipsToDisplay => _socialService.relationshipsToDisplay.value;

  bool isActive(SocialListTab tab) => activeTab == tab;

  Future<void> selectTab(SocialListTab tab) => _socialService.setActiveTab(tab);

  Future<void> setSearchQuery(String query) => _socialService.setSearchQuery(query);

  Future<void> sendFriendRequest(String userId) => _socialService.sendFriendRequest(userId);
  Future<void> acceptFriendRequest(String userId) => _socialService.acceptFriendRequest(userId);
  Future<void> declineFriendRequest(String userId) => _socialService.declineFriendRequest(userId);
  Future<void> removeFriend(String userId) => _socialService.removeFriend(userId);
  void blockUser(String userId) => _socialService.blockUser(userId);
  Future<void> unblockUser(String userId) => _socialService.unblockUser(userId);

  void _onSocialStateChanged() {
    notifyListeners();
  }

  @override
  void dispose() {
    _socialService.activeTab.removeListener(_onSocialStateChanged);
    _socialService.isLoading.removeListener(_onSocialStateChanged);
    _socialService.relationshipsToDisplay.removeListener(_onSocialStateChanged);
    _socialService.searchQuery.removeListener(_onSocialStateChanged);
    _socialService.resetActiveTab();
    super.dispose();
  }
}
