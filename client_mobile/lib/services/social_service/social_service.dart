import 'dart:convert';

import 'package:client_mobile/models/api_endpoints.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/http_status_code.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/social.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class SocialService {
  static final SocialService _instance = SocialService._internal();

  factory SocialService() {
    return _instance;
  }

  late final String baseUrl;
  String? _currentUserId;
  int _relationshipLatestRequestId = 0;

  final ValueNotifier<bool> isLoading = ValueNotifier<bool>(false);
  final ValueNotifier<String> searchQuery = ValueNotifier<String>('');
  final ValueNotifier<SocialListTab> activeTab = ValueNotifier<SocialListTab>(SocialListTab.Search);
  final ValueNotifier<List<SocialListItem>> relationshipsToDisplay = ValueNotifier<List<SocialListItem>>(<SocialListItem>[]);

  SocialService._internal() {
    String? serverUrl;
    try {
      serverUrl = dotenv.env['SERVER_URL'];
    } catch (_) {
      serverUrl = null;
    }
    baseUrl = (serverUrl == null || serverUrl.isEmpty) ? '' : '$serverUrl/api';
  }

  void _ensureConfigured() {
    if (baseUrl.isEmpty) {
      throw StateError(ErrorMessage.ServerUrlNotDefined.message);
    }
  }

  void initialize(String userId) {
    if (userId.trim().isEmpty) return;
    _currentUserId = userId;
    loadRelationshipList();
  }

  void clear() {
    _currentUserId = null;
    _relationshipLatestRequestId = 0;
    isLoading.value = false;
    searchQuery.value = '';
    activeTab.value = SocialListTab.Search;
    relationshipsToDisplay.value = const <SocialListItem>[];
  }

  Future<void> setActiveTab(SocialListTab tab) async {
    if (activeTab.value == tab) return;
    activeTab.value = tab;
    await loadRelationshipList();
  }

  Future<void> setSearchQuery(String query) async {
    final String normalizedQuery = query.trim();
    if (searchQuery.value == normalizedQuery) return;
    searchQuery.value = normalizedQuery;
    await loadRelationshipList();
  }

  void resetActiveTab() {
    activeTab.value = SocialListTab.Search;
  }

  Future<void> sendFriendRequest(String userId) async {
    await _performAction(SocialAction.SendFriendRequest, userId);
  }

  Future<void> acceptFriendRequest(String userId) async {
    await _performAction(SocialAction.AcceptFriendRequest, userId);
  }

  Future<void> declineFriendRequest(String userId) async {
    await _performAction(SocialAction.DeclineFriendRequest, userId);
  }

  Future<void> removeFriend(String userId) async {
    await _performAction(SocialAction.RemoveFriend, userId);
  }

  void blockUser(String userId) {
    final PopupMessage confirmBlockPopup = PopupMessage(
      message: I18nService().translate('popup.confirmBlockUser'),
      hasCloseButton: true,
      isConfirmation: true,
      popupColor: PopupColor.Orange,
      action: () => _performAction(SocialAction.BlockUser, userId),
    );
    PopupService().showPopup(confirmBlockPopup);
  }

  Future<void> unblockUser(String userId) async {
    await _performAction(SocialAction.UnblockUser, userId);
  }

  Future<void> loadRelationshipList() async {
    _ensureConfigured();
    final String? userId = _currentUserId;
    if (userId == null || userId.isEmpty) return;

    final int thisRequestId = ++_relationshipLatestRequestId;
    isLoading.value = true;

    try {
      final Uri uri = Uri.parse(
        '$baseUrl/${SocialEndpoint.List.path}/$userId',
      ).replace(queryParameters: <String, String>{'tab': activeTab.value.value, 'q': searchQuery.value});

      final http.Response response = await http.get(uri, headers: <String, String>{'Content-Type': 'application/json'});

      if (thisRequestId != _relationshipLatestRequestId) return;

      if (response.statusCode == HttpStatusCode.Ok.code) {
        final List<dynamic> decoded = jsonDecode(response.body) as List<dynamic>;
        relationshipsToDisplay.value = decoded
            .map((dynamic item) => SocialListItem.fromJson(Map<String, dynamic>.from(item as Map<dynamic, dynamic>)))
            .toList(growable: false);
      } else {
        relationshipsToDisplay.value = const <SocialListItem>[];
      }
    } catch (_) {
      if (thisRequestId != _relationshipLatestRequestId) return;
      relationshipsToDisplay.value = const <SocialListItem>[];
    } finally {
      if (thisRequestId == _relationshipLatestRequestId) {
        isLoading.value = false;
      }
    }
  }

  Future<void> _performAction(SocialAction action, String targetUserId) async {
    _ensureConfigured();
    final String? userId = _currentUserId;
    final String sanitizedTarget = targetUserId.trim();
    if (userId == null || sanitizedTarget.isEmpty || userId == sanitizedTarget) return;

    final Uri uri = Uri.parse('$baseUrl/${SocialEndpoint.Base.path}/${action.value}');
    final Map<String, String> payload = <String, String>{'userId': userId, 'targetUserId': sanitizedTarget};

    final http.Response response = await http.post(uri, headers: <String, String>{'Content-Type': 'application/json'}, body: jsonEncode(payload));

    if (response.statusCode == HttpStatusCode.Ok.code || response.statusCode == HttpStatusCode.NoContent.code) {
      await loadRelationshipList();
      return;
    }

    throw Exception('Failed social action ${action.value}: ${response.body}');
  }
}
