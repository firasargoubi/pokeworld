import 'dart:convert';

import 'package:client_mobile/models/user_preferences.dart';
import 'package:flutter/services.dart';

class I18nService {
  static final I18nService _instance = I18nService._internal();

  factory I18nService() {
    return _instance;
  }

  I18nService._internal();

  AppLanguage _currentLanguage = UserPreferences.defaults.language;
  Map<String, String> _translations = {};
  Future<void>? _pendingLoad;
  AppLanguage? _pendingLanguage;

  AppLanguage get currentLanguage => _currentLanguage;

  Future<void> initialize(AppLanguage language) async {
    await use(language);
  }

  Future<void> _loadLanguage(AppLanguage language) async {
    final langCode = language.code;
    final jsonContent = await rootBundle.loadString('assets/i18n/$langCode.json');
    final Map<String, dynamic> jsonMap = json.decode(jsonContent);
    _translations = _flattenTranslations(jsonMap);
    _currentLanguage = language;
  }

  Map<String, String> _flattenTranslations(Map<String, dynamic> json, [String prefix = '']) {
    final Map<String, String> translations = {};
    json.forEach((String key, dynamic value) {
      final newKey = prefix.isEmpty ? key : '$prefix.$key';
      if (value is Map<String, dynamic>) {
        translations.addAll(_flattenTranslations(value, newKey));
      } else {
        translations[newKey] = value.toString();
      }
    });
    return translations;
  }

  Future<void> use(AppLanguage language) async {
    if (_pendingLanguage == language && _pendingLoad != null) {
      await _pendingLoad;
      return;
    }

    if (_currentLanguage == language && _translations.isNotEmpty && _pendingLoad == null) {
      return;
    }

    final loadFuture = _loadLanguage(language);
    _pendingLanguage = language;
    _pendingLoad = loadFuture;

    try {
      await loadFuture;
    } finally {
      if (identical(_pendingLoad, loadFuture)) {
        _pendingLoad = null;
        _pendingLanguage = null;
      }
    }
  }

  String translate(String key, {Map<String, Object?> params = const {}}) {
    final value = _translations[key] ?? key;
    var resolved = value;
    params.forEach((name, value) {
      resolved = resolved.replaceAll('{{$name}}', value?.toString() ?? '');
    });
    return resolved.replaceAll('<br/>', '\n');
  }
}
