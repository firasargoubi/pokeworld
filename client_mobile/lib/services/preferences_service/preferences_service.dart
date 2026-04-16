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
  String? _equippedMusicId;
  String? _equippedButtonId;

  final ValueNotifier<AppLanguage> currentLanguage = ValueNotifier<AppLanguage>(UserPreferences.defaults.language);
  final ValueNotifier<AppTheme> currentTheme = ValueNotifier<AppTheme>(UserPreferences.defaults.theme);
  final ValueNotifier<String?> equippedButtonNotifier = ValueNotifier<String?>(null);

  Locale get currentLocale => Locale(currentLanguage.value.code);
  ThemeMode get currentThemeMode => currentTheme.value == AppTheme.Dark ? ThemeMode.dark : ThemeMode.light;

  String? get equippedMusicId => _equippedMusicId;
  String? get equippedButtonId => _equippedButtonId;

  String getEquippedMenuMusicPath() {
    final equippedIdOrDefault = _equippedMusicId ?? DEFAULT_MUSIC_ITEM_ID;
    return MUSIC_ITEM_TO_PATH[equippedIdOrDefault] ?? MUSIC_ITEM_TO_PATH[DEFAULT_MUSIC_ITEM_ID]!;
  }

  String getEquippedBallAsset({bool active = false}) {
    final id = _equippedButtonId;
    if (id == null || id == 'poke-button-0') {
      return active ? 'assets/images/menu/buttons/poke-button/party-ball-sel-0.png' : 'assets/images/menu/buttons/poke-button/party-ball-0.png';
    }
    final map = active ? BUTTON_ITEM_TO_BALL_ACTIVE_ASSET : BUTTON_ITEM_TO_BALL_ASSET;
    return map[id] ??
        (active ? 'assets/images/menu/buttons/poke-button/party-ball-sel-0.png' : 'assets/images/menu/buttons/poke-button/party-ball-0.png');
  }

  String _buttonIdToVariant(String? itemId) {
    const map = {'party-ball': '1', 'party-ball-2': '2', 'party-ball-3': '3', 'party-ball-4': '4'};
    return map[itemId] ?? '0';
  }

  String _musicIdToVariant(String? itemId) {
    const map = {'menu-music-1': '1', 'menu-music-2': '2', 'menu-music-3': '3'};
    return map[itemId] ?? '0';
  }

  String? _variantToButtonId(String? variant) {
    const map = {'1': 'party-ball', '2': 'party-ball-2', '3': 'party-ball-3', '4': 'party-ball-4'};
    return map[variant];
  }

  String? _variantToMusicId(String? variant) {
    const map = {'1': 'menu-music-1', '2': 'menu-music-2', '3': 'menu-music-3'};
    return map[variant];
  }

  Future<void> setEquippedMusic(String? itemId) async {
    _equippedMusicId = itemId;
    final prefs = await SharedPreferences.getInstance();
    if (itemId == null) {
      await prefs.remove(EQUIPPED_MUSIC_STORAGE_KEY);
    } else {
      await prefs.setString(EQUIPPED_MUSIC_STORAGE_KEY, itemId);
    }
    final user = _userService.currentUser.value;
    if (user != null) {
      final variant = _musicIdToVariant(itemId);
      await _userService.updatePreferences(user.userId, menuMusic: variant);
    }
  }

  Future<void> setEquippedButton(String? itemId) async {
    _equippedButtonId = itemId;
    equippedButtonNotifier.value = itemId;
    final prefs = await SharedPreferences.getInstance();
    if (itemId == null) {
      await prefs.remove(EQUIPPED_BUTTON_STORAGE_KEY);
    } else {
      await prefs.setString(EQUIPPED_BUTTON_STORAGE_KEY, itemId);
    }
    final user = _userService.currentUser.value;
    if (user != null) {
      final variant = _buttonIdToVariant(itemId);
      await _userService.updatePreferences(user.userId, partyBall: variant);
    }
  }

  Future<void> initialize() async {
    final sharedPreferences = await SharedPreferences.getInstance();
    final storedLanguageCode = sharedPreferences.getString(PRE_AUTH_LANG_STORAGE_KEY);
    final storedThemeCode = sharedPreferences.getString(PRE_AUTH_THEME_STORAGE_KEY);
    _preAuthLanguage = AppLanguage.fromCode(storedLanguageCode);
    _preAuthTheme = AppTheme.fromCode(storedThemeCode);
    _equippedMusicId = sharedPreferences.getString(EQUIPPED_MUSIC_STORAGE_KEY);
    _equippedButtonId = sharedPreferences.getString(EQUIPPED_BUTTON_STORAGE_KEY);
    equippedButtonNotifier.value = _equippedButtonId;
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
      _equippedMusicId = null;
      _equippedButtonId = null;
      equippedButtonNotifier.value = null;
      SharedPreferences.getInstance().then((prefs) {
        prefs.remove(EQUIPPED_MUSIC_STORAGE_KEY);
        prefs.remove(EQUIPPED_BUTTON_STORAGE_KEY);
      });
      return;
    }

    _applyLanguage(user.preferences.language);
    currentTheme.value = user.preferences.theme;
    _syncEquippedFromUserPreferences(user.preferences);
  }

  void syncPreferencesFromUser() {
    final user = _userService.currentUser.value;
    if (user != null) {
      _applyLanguage(user.preferences.language);
      currentTheme.value = user.preferences.theme;
      _syncEquippedFromUserPreferences(user.preferences);
    }
  }

  void _syncEquippedFromUserPreferences(UserPreferences preferences) {
    final buttonId = _variantToButtonId(preferences.partyBall);
    final musicId = _variantToMusicId(preferences.menuMusic);
    _equippedButtonId = buttonId;
    _equippedMusicId = musicId;
    equippedButtonNotifier.value = buttonId;
    SharedPreferences.getInstance().then((prefs) {
      if (buttonId == null) {
        prefs.remove(EQUIPPED_BUTTON_STORAGE_KEY);
      } else {
        prefs.setString(EQUIPPED_BUTTON_STORAGE_KEY, buttonId);
      }
      if (musicId == null) {
        prefs.remove(EQUIPPED_MUSIC_STORAGE_KEY);
      } else {
        prefs.setString(EQUIPPED_MUSIC_STORAGE_KEY, musicId);
      }
    });
  }

  void _applyLanguage(AppLanguage language) {
    currentLanguage.value = language;
    _i18nService.use(language);
  }
}
