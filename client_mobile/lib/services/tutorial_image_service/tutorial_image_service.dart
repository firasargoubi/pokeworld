import 'dart:typed_data';

import 'package:client_mobile/consts/server_const.dart';
import 'package:client_mobile/consts/tutorial_catalog_const.dart';
import 'package:client_mobile/models/http_status_code.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import 'tutorial_image_service_const.dart';

class TutorialImageService {
  static final TutorialImageService _instance = TutorialImageService._internal();
  final Map<String, Uint8List> _imageCache = {};
  final Map<String, Future<Uint8List?>> _inFlightRequests = {};

  factory TutorialImageService() => _instance;

  TutorialImageService._internal();

  String _normalizeTutorialAssetPath(String tutorialAssetPath) {
    if (tutorialAssetPath.startsWith(TUTORIAL_ASSETS_PREFIX)) {
      return tutorialAssetPath.substring(TUTORIAL_ASSETS_PREFIX.length);
    }

    return tutorialAssetPath.replaceFirst(RegExp(r'^/+'), '');
  }

  String? get _serverUrl {
    final value = dotenv.env[SERVER_URL_KEY]?.trim();
    if (value == null || value.isEmpty) {
      return null;
    }

    return value.replaceFirst(RegExp(r'/+$'), '');
  }

  String? buildImageUrl(String tutorialAssetPath) {
    if (tutorialAssetPath.isEmpty) {
      return null;
    }

    final serverUrl = _serverUrl;
    if (serverUrl == null) {
      return null;
    }

    final normalizedPath = _normalizeTutorialAssetPath(tutorialAssetPath);

    return '$serverUrl/assets/images/menu/tutorial/$normalizedPath';
  }

  Uint8List? getCachedImageBytes(String tutorialAssetPath) {
    final normalizedPath = _normalizeTutorialAssetPath(tutorialAssetPath);
    return _imageCache[normalizedPath];
  }

  Future<Uint8List?> fetchImageBytes(String tutorialAssetPath) async {
    final normalizedPath = _normalizeTutorialAssetPath(tutorialAssetPath);
    final cachedBytes = _imageCache[normalizedPath];
    if (cachedBytes != null) {
      return cachedBytes;
    }

    return _inFlightRequests.putIfAbsent(normalizedPath, () async {
      try {
        final imageUrl = buildImageUrl(normalizedPath);
        if (imageUrl == null) {
          return null;
        }

        final response = await http.get(Uri.parse(imageUrl));
        if (response.statusCode != HttpStatusCode.Ok.code) {
          return null;
        }

        final bytes = response.bodyBytes;
        if (bytes.isEmpty) {
          return null;
        }

        _imageCache[normalizedPath] = bytes;
        return bytes;
      } finally {
        _inFlightRequests.remove(normalizedPath);
      }
    });
  }

  Future<void> prefetchTutorialWindow(int currentStepIndex, AppLanguage language, {int radius = TUTORIAL_PREFETCH_WINDOW_RADIUS}) async {
    if (TUTORIAL_STEPS.isEmpty) {
      return;
    }

    final lowerBound = (currentStepIndex - radius).clamp(0, TUTORIAL_STEPS.length - 1);
    final upperBound = (currentStepIndex + radius).clamp(0, TUTORIAL_STEPS.length - 1);

    final imagePaths = <String>{TUTORIAL_SHARED_PROFESSOR_PATH};

    for (int index = lowerBound; index <= upperBound; index++) {
      final tutorialStep = TUTORIAL_STEPS[index];
      final imagePath = language == AppLanguage.French ? tutorialStep.imagePathFr : tutorialStep.imagePathEn;
      imagePaths.add(imagePath);
    }

    await Future.wait(imagePaths.map(fetchImageBytes));
  }
}
