import 'package:client_mobile/consts/preferences_const.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  static final PreferencesService _instance = PreferencesService._internal();

  factory PreferencesService() {
    return _instance;
  }

  PreferencesService._internal();
  final I18nService _i18nService = I18nService();
  final UserService _userService = UserService();
  AppLanguage _preAuthLanguage = UserPreferences.defaults.language;
  AppTheme _preAuthTheme = UserPreferences.defaults.theme;
  bool _isUserListenerBound = false;

  final ValueNotifier<AppLanguage> currentLanguage = ValueNotifier<AppLanguage>(UserPreferences.defaults.language);
  final ValueNotifier<AppTheme> currentTheme = ValueNotifier<AppTheme>(UserPreferences.defaults.theme);

  Locale get currentLocale => Locale(currentLanguage.value.code);
  ThemeMode get currentThemeMode => currentTheme.value == AppTheme.Dark ? ThemeMode.dark : ThemeMode.light;

  Future<void> initialize() async {
    final sharedPreferences = await SharedPreferences.getInstance();
    final storedLanguageCode = sharedPreferences.getString(PRE_AUTH_LANG_STORAGE_KEY);
    final storedThemeCode = sharedPreferences.getString(PRE_AUTH_THEME_STORAGE_KEY);
    _preAuthLanguage = AppLanguage.fromCode(storedLanguageCode);
    _preAuthTheme = AppTheme.fromCode(storedThemeCode);
    await _i18nService.initialize(_preAuthLanguage);
    currentLanguage.value = _preAuthLanguage;
    currentTheme.value = _preAuthTheme;
    _bindUserLanguageSync();
  }

  Future<void> setLanguageBeforeAuth(AppLanguage language) async {
    _preAuthLanguage = language;
    final sharedPreferences = await SharedPreferences.getInstance();
    await sharedPreferences.setString(PRE_AUTH_LANG_STORAGE_KEY, language.code);

    if (_userService.currentUser.value != null) {
      return;
    }

    _applyLanguage(language);
  }

  Future<void> setThemeBeforeAuth(AppTheme theme) async {
    _preAuthTheme = theme;
    final sharedPreferences = await SharedPreferences.getInstance();
    await sharedPreferences.setString(PRE_AUTH_THEME_STORAGE_KEY, theme.code);

    if (_userService.currentUser.value != null) {
      return;
    }

    currentTheme.value = theme;
  }

  Future<void> setLanguage(AppLanguage language) async {
    final previousLanguage = currentLanguage.value;
    _applyLanguage(language);

    final user = _userService.currentUser.value;
    if (user == null) {
      await setLanguageBeforeAuth(language);
      return;
    }

    try {
      final preferences = await _userService.updatePreferences(user.userId, language: language);
      _applyLanguage(preferences.language);
    } catch (_) {
      _applyLanguage(previousLanguage);
      rethrow;
    }
  }

  Future<void> setTheme(AppTheme theme) async {
    final previousTheme = currentTheme.value;
    currentTheme.value = theme;

    final user = _userService.currentUser.value;
    if (user == null) {
      await setThemeBeforeAuth(theme);
      return;
    }

    try {
      final preferences = await _userService.updatePreferences(user.userId, theme: theme);
      currentTheme.value = preferences.theme;
    } catch (_) {
      currentTheme.value = previousTheme;
      rethrow;
    }
  }

  void _bindUserLanguageSync() {
    if (_isUserListenerBound) {
      return;
    }

    _isUserListenerBound = true;
    _userService.currentUser.addListener(_handleUserChanged);
  }

  void _handleUserChanged() {
    final user = _userService.currentUser.value;

    if (user == null) {
      _applyLanguage(_preAuthLanguage);
      currentTheme.value = AppTheme.DefaultTheme;
      return;
    }

    _applyLanguage(user.preferences.language);
    currentTheme.value = user.preferences.theme;
  }

  void syncPreferencesFromUser() {
    final user = _userService.currentUser.value;
    if (user != null) {
      _applyLanguage(user.preferences.language);
      currentTheme.value = user.preferences.theme;
    }
  }

  void _applyLanguage(AppLanguage language) {
    currentLanguage.value = language;
    _i18nService.use(language);
  }
}
