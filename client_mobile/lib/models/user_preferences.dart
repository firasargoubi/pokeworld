enum AppLanguage {
  French('fr'),
  English('en');

  const AppLanguage(this.code);

  final String code;

  static AppLanguage fromCode(dynamic value) {
    final code = value?.toString();
    return AppLanguage.values.firstWhere((language) => language.code == code, orElse: () => AppLanguage.French);
  }
}

enum AppTheme {
  DefaultTheme('default'),
  Dark('dark');

  const AppTheme(this.code);

  final String code;

  static AppTheme fromCode(dynamic value) {
    final code = value?.toString();
    return AppTheme.values.firstWhere((theme) => theme.code == code, orElse: () => AppTheme.DefaultTheme);
  }
}

class UserPreferences {
  const UserPreferences({required this.language, required this.theme, this.partyBall, this.menuMusic});

  final AppLanguage language;
  final AppTheme theme;
  final String? partyBall;
  final String? menuMusic;

  static const UserPreferences defaults = UserPreferences(language: AppLanguage.French, theme: AppTheme.DefaultTheme);

  factory UserPreferences.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return defaults;
    }

    return UserPreferences(
      language: AppLanguage.fromCode(json['language']),
      theme: AppTheme.fromCode(json['theme']),
      partyBall: json['partyBall'] as String?,
      menuMusic: json['menuMusic'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {'language': language.code, 'theme': theme.code};
  }
}
