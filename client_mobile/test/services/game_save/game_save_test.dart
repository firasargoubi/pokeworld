import 'dart:convert';

import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/services/game_save/game_save.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  const baseUrl = 'http://localhost:3000';

  Map<String, dynamic> gameJson() => {
    '_id': 'g1',
    'name': 'Test Game',
    'description': '',
    'lastEdited': '2024-01-01T00:00:00.000',
    'mapData': {'tiles': List.generate(10, (_) => List.generate(10, (_) => 'Grass')), 'items': {}, 'size': 10, 'gameMode': 'FFA'},
    'thumbnail': '',
  };

  setUp(() => dotenv.testLoad(fileInput: 'SERVER_URL=$baseUrl'));

  group('getAllGames', () {
    test('should throw when SERVER_URL is not set', () {
      dotenv.testLoad(fileInput: '');
      expect(GameSaveService.getAllGames(), throwsException);
    });

    test('should return list of GameData on 200 response', () async {
      final client = MockClient((_) async => http.Response(jsonEncode([gameJson()]), 200));
      final result = await http.runWithClient(() => GameSaveService.getAllGames(), () => client);
      expect(result, hasLength(1));
      expect(result.first, isA<GameData>());
      expect(result.first.name, equals('Test Game'));
    });

    test('should return empty list when response body is empty array', () async {
      final client = MockClient((_) async => http.Response('[]', 200));
      final result = await http.runWithClient(() => GameSaveService.getAllGames(), () => client);
      expect(result, isEmpty);
    });

    test('should throw when status code is not 200', () {
      final client = MockClient((_) async => http.Response('error', 404));
      expect(http.runWithClient(() => GameSaveService.getAllGames(), () => client), throwsException);
    });

    test('should throw when response body is not a JSON list', () {
      final client = MockClient((_) async => http.Response(jsonEncode({'key': 'value'}), 200));
      expect(http.runWithClient(() => GameSaveService.getAllGames(), () => client), throwsException);
    });
  });
}
