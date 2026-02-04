import 'dart:convert';

import 'package:client_mobile/consts/api_endpoints.dart';
import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/consts/error_messages.dart';
import 'package:client_mobile/consts/http_status_code.dart';
import 'package:client_mobile/consts/socket_event.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/services/socket_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class UserService {
  static final UserService _instance = UserService._internal();

  factory UserService() {
    return _instance;
  }

  late final String baseUrl;
  final SocketService _socketService = SocketService();

  UserService._internal() {
    final serverUrl = dotenv.env['SERVER_URL'];
    if (serverUrl == null || serverUrl.isEmpty) {
      throw StateError(ErrorMessages.serverUrlNotDefined);
    }
    baseUrl = '$serverUrl/api';
  }

  final ValueNotifier<UserInfo?> currentUser = ValueNotifier<UserInfo?>(null);

  Future<UserInfo> login(String username, String password) async {
    final String uri = '$baseUrl/${userEndpoints['UserLogin']}';
    final postBody = {'username': username, 'password': password};
    final bodyJson = jsonEncode(postBody);
    final response = await http.post(
      Uri.parse(uri),
      headers: {"Content-Type": "application/json"},
      body: bodyJson,
    );
    if (response.statusCode == HttpStatusCode.ok.code) {
      Map<String, dynamic> responseMap = jsonDecode(response.body);
      UserInfo user = UserInfo.fromJson(responseMap);
      currentUser.value = user;
      _socketService.emit(UserEvent.associate.value, user);
      return user;
    } else if (response.statusCode == HttpStatusCode.unauthorized.code) {
      throw AuthException(AuthError.invalidCredentials);
    } else if (response.statusCode == HttpStatusCode.notFound.code) {
      throw AuthException(AuthError.userNotFound);
    } else if (response.statusCode == HttpStatusCode.conflict.code) {
      throw AuthException(AuthError.alreadyConnected);
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }

  Future<UserInfo> register(String username, String password) async {
    final String uri = '$baseUrl/${userEndpoints['UserRegister']}';
    final postBody = {'username': username, 'password': password};
    final bodyJson = jsonEncode(postBody);
    final response = await http.post(
      Uri.parse(uri),
      headers: {"Content-Type": "application/json"},
      body: bodyJson,
    );
    if (response.statusCode == HttpStatusCode.ok.code ||
        response.statusCode == HttpStatusCode.created.code) {
      Map<String, dynamic> responseMap = jsonDecode(response.body);
      UserInfo user = UserInfo.fromJson(responseMap);
      currentUser.value = user;
      _socketService.emit(UserEvent.associate.value, user);
      return user;
    } else if (response.statusCode == HttpStatusCode.conflict.code) {
      throw AuthException(AuthError.usernameExists);
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  Future<void> logout() async {
    final userId = currentUser.value?.userId;
    if (userId == null) return;
    final String uri = '$baseUrl/${userEndpoints['UserLogout']}/$userId';
    final response = await http.post(
      Uri.parse(uri),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({}),
    );
    if (response.statusCode != HttpStatusCode.ok.code &&
        response.statusCode != HttpStatusCode.noContent.code) {
      throw Exception('Failed to logout: ${response.body}');
    }
    currentUser.value = null;
  }
}
