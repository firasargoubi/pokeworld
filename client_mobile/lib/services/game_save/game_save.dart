import 'dart:convert';

import 'package:client_mobile/consts/server_const.dart';
import 'package:client_mobile/models/api_endpoints.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import '../../models/game_data.dart';

class GameSaveService {
  static const String errorMissingServerUrl = 'SERVER_URL is not set';
  static const String errorInvalidResponseFormat = 'Invalid response format';

  static Future<List<GameData>> getAllGames() async {
    final baseUrl = dotenv.env[SERVER_URL_KEY];
    if (baseUrl == null || baseUrl.trim().isEmpty) {
      throw Exception(errorMissingServerUrl);
    }

    final uri = Uri.parse('$baseUrl${GameEndpoint.GetAllGames.path}');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Failed to load games: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! List) {
      throw Exception(errorInvalidResponseFormat);
    }

    return decoded.whereType<Map>().map((e) => GameData.fromJson(e.cast<String, dynamic>())).toList();
  }
}
