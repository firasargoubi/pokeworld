import 'dart:convert';

import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/models/api_endpoints.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/http_status_code.dart';
import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
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
    String? serverUrl;
    try {
      serverUrl = dotenv.env['SERVER_URL'];
    } catch (_) {
      serverUrl = null;
    }
    baseUrl = (serverUrl == null || serverUrl.isEmpty) ? '' : '$serverUrl/api';
  }

  final ValueNotifier<UserInfo?> currentUser = ValueNotifier<UserInfo?>(null);

  void _ensureConfigured() {
    if (baseUrl.isEmpty) {
      throw StateError(ErrorMessage.ServerUrlNotDefined.message);
    }
  }

  void _addOptionalField(Map<String, dynamic> payload, String fieldName, String? value) {
    if (value != null && value.trim().isNotEmpty) {
      payload[fieldName] = value.trim();
    }
  }

  Future<UserInfo> login(String username, String password) async {
    _ensureConfigured();
    final String uri = '$baseUrl/${UserEndpoint.UserLogin.path}';
    final postBody = {'username': username, 'password': password};
    final bodyJson = jsonEncode(postBody);
    final response = await http.post(Uri.parse(uri), headers: {"Content-Type": "application/json"}, body: bodyJson);
    if (response.statusCode == HttpStatusCode.Ok.code) {
      Map<String, dynamic> responseMap = jsonDecode(response.body);
      UserInfo user = UserInfo.fromJson(responseMap);
      currentUser.value = user;
      _socketService.emit(UserEvent.Associate.value, user);
      return user;
    } else if (response.statusCode == HttpStatusCode.NotFound.code) {
      throw AuthException(AuthError.invalidCredentials);
    } else if (response.statusCode == HttpStatusCode.Conflict.code) {
      throw AuthException(AuthError.alreadyConnected);
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }

  Future<UserInfo> register(
    String username,
    String email,
    String password,
    String avatarPath,
    String fullAvatarPath, {
    UserPreferences? preferences,
  }) async {
    _ensureConfigured();
    final String uri = '$baseUrl/${UserEndpoint.UserRegister.path}';

    final String avatarImg64 = await _resolveImageInput(avatarPath);
    final String fullAvataImg64 = await _resolveImageInput(fullAvatarPath);

    final postBody = {
      'username': username,
      'email': email,
      'password': password,
      'profilePicture': avatarImg64,
      'fullProfilePicture': fullAvataImg64,
      if (preferences != null) 'preferences': preferences.toJson(),
    };
    final bodyJson = jsonEncode(postBody);
    final response = await http.post(Uri.parse(uri), headers: {"Content-Type": "application/json"}, body: bodyJson);
    if (response.statusCode == HttpStatusCode.Ok.code || response.statusCode == HttpStatusCode.Created.code) {
      Map<String, dynamic> responseMap = jsonDecode(response.body);
      UserInfo user = UserInfo.fromJson(responseMap);
      currentUser.value = user;
      _socketService.emit(UserEvent.Associate.value, user);
      return user;
    } else if (response.statusCode == HttpStatusCode.Conflict.code) {
      throw AuthException(AuthError.usernameExists);
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  Future<String> _resolveImageInput(String source) async {
    if (source.startsWith('data:image')) {
      return source;
    }

    final ByteData byteData = await rootBundle.load(source);
    final Uint8List bytes = byteData.buffer.asUint8List();
    return 'data:image/png;base64,${base64Encode(bytes)}';
  }

  Future<void> logout() async {
    _ensureConfigured();
    final userId = currentUser.value?.userId;
    if (userId == null) return;
    final String uri = '$baseUrl/${UserEndpoint.UserLogout.path}/$userId';
    final response = await http.post(Uri.parse(uri), headers: {"Content-Type": "application/json"}, body: jsonEncode({}));
    if (response.statusCode != HttpStatusCode.Ok.code && response.statusCode != HttpStatusCode.NoContent.code) {
      throw Exception(ErrorMessage.LogoutFailed.message);
    }
    currentUser.value = null;
  }

  Future<UserInfo> edit({required String userId, String? oldPassword, String? password, String? username, int? tutorialStep}) async {
    _ensureConfigured();
    final String uri = '$baseUrl/${UserEndpoint.UserEdit.path}';
    final Map<String, dynamic> payload = {'userId': userId};

    _addOptionalField(payload, 'oldPassword', oldPassword);
    _addOptionalField(payload, 'password', password);
    _addOptionalField(payload, 'username', username);
    if (tutorialStep != null) payload['tutorialStep'] = tutorialStep;

    final bodyJson = jsonEncode(payload);
    final response = await http.put(Uri.parse(uri), headers: {'Content-Type': 'application/json'}, body: bodyJson);
    if (response.statusCode == HttpStatusCode.Ok.code) {
      final Map<String, dynamic> responseMap = jsonDecode(response.body);
      final UserInfo user = UserInfo.fromJson(responseMap);
      currentUser.value = user;
      _socketService.emit(UserEvent.Associate.value, user);
      return user;
    }
    return currentUser.value!;
  }

  Future<void> delete(String userId) async {
    _ensureConfigured();
    final String uri = '$baseUrl/${UserEndpoint.User.path}/$userId';
    final response = await http.delete(Uri.parse(uri), headers: {'Content-Type': 'application/json'});
    if (response.statusCode != HttpStatusCode.Ok.code && response.statusCode != HttpStatusCode.NoContent.code) {
      throw Exception(ErrorMessage.DeleteAccountFailed.message);
    }
    currentUser.value = null;
  }

  Future<UserPreferences> updatePreferences(String userId, {AppLanguage? language, AppTheme? theme}) async {
    _ensureConfigured();
    final patchBody = <String, String>{};

    if (language != null) {
      patchBody['language'] = language.code;
    }

    if (theme != null) {
      patchBody['theme'] = theme.code;
    }

    if (patchBody.isEmpty) {
      final currentPreferences = currentUser.value?.preferences;
      if (currentPreferences != null) {
        return currentPreferences;
      }
      return UserPreferences.defaults;
    }

    final String uri = '$baseUrl/${UserEndpoint.User.path}/$userId/preferences';
    final response = await http.patch(Uri.parse(uri), headers: {'Content-Type': 'application/json'}, body: jsonEncode(patchBody));

    if (response.statusCode == HttpStatusCode.Ok.code) {
      final Map<String, dynamic> responseMap = jsonDecode(response.body);
      final UserPreferences preferences = UserPreferences.fromJson(responseMap);
      final UserInfo? existingUser = currentUser.value;

      if (existingUser != null && existingUser.userId == userId) {
        currentUser.value = UserInfo(
          username: existingUser.username,
          userId: existingUser.userId,
          email: existingUser.email,
          profilePicture: existingUser.profilePicture,
          fullProfilePicture: existingUser.fullProfilePicture,
          balance: existingUser.balance,
          createdAt: existingUser.createdAt,
          preferences: preferences,
          inventory: existingUser.inventory,
          tutorialStep: existingUser.tutorialStep,
        );
      }

      return preferences;
    }

    throw Exception(ErrorMessage.ChangeFailed.message);
  }

  void listenToSocketDisconnect() {
    _socketService.onDisconnect((_) {
      currentUser.value = null;
    });
  }
}
