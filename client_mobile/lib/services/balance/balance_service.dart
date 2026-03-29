import 'dart:convert';

import 'package:client_mobile/models/api_endpoints.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/http_status_code.dart';
import 'package:client_mobile/models/shop.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class BalanceService {
  static final BalanceService _instance = BalanceService._internal();

  factory BalanceService() {
    return _instance;
  }

  late final String baseUrl;
  final UserService _userService = UserService();

  BalanceService._internal() {
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

  Future<List<ShopItem>> getShopItems() async {
    _ensureConfigured();
    final String uri = '$baseUrl/${ShopEndpoint.Balance.path}/items';
    final response = await http.get(Uri.parse(uri), headers: {'Content-Type': 'application/json'});
    if (response.statusCode == HttpStatusCode.Ok.code) {
      final List<dynamic> responseList = jsonDecode(response.body);
      if (kDebugMode) {
        print('Fetched shop items: $responseList');
      }
      return responseList.map((item) => ShopItem.fromJson(item as Map<String, dynamic>)).toList();
    }
    throw Exception('Failed to fetch shop items: ${response.body}');
  }

  Future<UserInfo> purchaseItem(String userId, String itemId) async {
    _ensureConfigured();
    final String uri = '$baseUrl/${ShopEndpoint.Balance.path}/$userId/purchase';
    final bodyJson = jsonEncode({'itemId': itemId});
    final response = await http.post(Uri.parse(uri), headers: {'Content-Type': 'application/json'}, body: bodyJson);
    if (response.statusCode == HttpStatusCode.Ok.code) {
      final Map<String, dynamic> responseMap = jsonDecode(response.body);
      final UserInfo user = UserInfo.fromJson(responseMap);
      _userService.currentUser.value = user;
      return user;
    }
    throw Exception('Failed to purchase item: ${response.body}');
  }
}
