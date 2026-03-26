import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:flutter/material.dart';

import 'settings_popup_const.dart';
import 'settings_popup_widgets.dart';

class SettingsPopup extends StatefulWidget {
  const SettingsPopup({super.key, required this.onClose});

  final VoidCallback onClose;

  @override
  State<SettingsPopup> createState() => _SettingsPopupState();
}

class _SettingsPopupState extends State<SettingsPopup> {
  late double _musicVolume;
  late double _effectsVolume;
  late double _avatarsVolume;
  SettingsTab _selectedTab = SettingsTab.audio;

  final PreferencesService _preferencesService = PreferencesService();

  @override
  void initState() {
    super.initState();
    _musicVolume = AudioService().backgroundVolume.value;
    _effectsVolume = AudioService().effectsVolume.value;
    _avatarsVolume = AudioService().avatarsVolume.value;
    AudioService().backgroundVolume.addListener(_onMusicVolumeChanged);
    AudioService().effectsVolume.addListener(_onEffectsVolumeChanged);
    AudioService().avatarsVolume.addListener(_onAvatarsVolumeChanged);
    _preferencesService.currentLanguage.addListener(_onPreferencesChanged);
    _preferencesService.currentTheme.addListener(_onPreferencesChanged);
  }

  @override
  void dispose() {
    AudioService().backgroundVolume.removeListener(_onMusicVolumeChanged);
    AudioService().effectsVolume.removeListener(_onEffectsVolumeChanged);
    AudioService().avatarsVolume.removeListener(_onAvatarsVolumeChanged);
    _preferencesService.currentLanguage.removeListener(_onPreferencesChanged);
    _preferencesService.currentTheme.removeListener(_onPreferencesChanged);
    super.dispose();
  }

  void _onMusicVolumeChanged() {
    if (mounted) setState(() => _musicVolume = AudioService().backgroundVolume.value);
  }

  void _onEffectsVolumeChanged() {
    if (mounted) setState(() => _effectsVolume = AudioService().effectsVolume.value);
  }

  void _onAvatarsVolumeChanged() {
    if (mounted) setState(() => _avatarsVolume = AudioService().avatarsVolume.value);
  }

  void _onPreferencesChanged() {
    if (mounted) setState(() {});
  }

  TextStyle _pixelTextStyle(double fontSize) => TextStyle(
    fontFamily: FONT_FAMILY,
    color: Colors.white,
    fontSize: fontSize,
    decoration: TextDecoration.none,
    height: 0.9,
    shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: SHADOW_COLOR)],
  );

  double _computeBaseSize(Size screenSize) {
    final screenWidth = screenSize.width;
    final screenHeight = screenSize.height;

    late final double baseWidth;
    late final double baseHeight;

    if (screenWidth / screenHeight > DESIGN_ASPECT_RATIO) {
      baseHeight = screenHeight;
      baseWidth = baseHeight * DESIGN_ASPECT_RATIO;
    } else {
      baseWidth = screenWidth;
      baseHeight = baseWidth / DESIGN_ASPECT_RATIO;
    }

    return min(baseWidth, baseHeight);
  }

  void _onMusicVolumeChange(double value) {
    setState(() => _musicVolume = value);
    AudioService().setBackgroundVolume(value);
  }

  void _onEffectsVolumeChange(double value) {
    setState(() => _effectsVolume = value);
    AudioService().setEffectsVolume(value);
  }

  void _onAvatarsVolumeChange(double value) {
    setState(() => _avatarsVolume = value);
    AudioService().setAvatarsVolume(value);
  }

  void _selectLanguage(AppLanguage language) {
    _preferencesService.setLanguage(language);
  }

  void _selectTheme(AppTheme theme) {
    _preferencesService.setTheme(theme);
  }

  Widget _buildAudioTab(I18nService i18n, TextStyle labelStyle, double sliderWidth, double sliderHeight) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        VolumeSlider(
          label: i18n.translate(MUSIC_LABEL),
          value: _musicVolume,
          onChanged: _onMusicVolumeChange,
          labelStyle: labelStyle,
          sliderWidth: sliderWidth,
          sliderHeight: sliderHeight,
        ),
        SizedBox(height: sliderHeight),
        VolumeSlider(
          label: i18n.translate(EFFECTS_LABEL),
          value: _effectsVolume,
          onChanged: _onEffectsVolumeChange,
          labelStyle: labelStyle,
          sliderWidth: sliderWidth,
          sliderHeight: sliderHeight,
        ),
        SizedBox(height: sliderHeight),
        VolumeSlider(
          label: i18n.translate(AVATARS_LABEL),
          value: _avatarsVolume,
          onChanged: _onAvatarsVolumeChange,
          labelStyle: labelStyle,
          sliderWidth: sliderWidth,
          sliderHeight: sliderHeight,
        ),
      ],
    );
  }

  Widget _buildPreferencesTab(I18nService i18n, TextStyle labelStyle, TextStyle optionStyle, double baseSize) {
    final currentLanguage = _preferencesService.currentLanguage.value;
    final currentTheme = _preferencesService.currentTheme.value;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(i18n.translate(LANGUAGE_LABEL), style: labelStyle),
        SizedBox(height: baseSize * 0.015),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            OptionButton(
              label: i18n.translate(LANGUAGE_FR_LABEL),
              isActive: currentLanguage == AppLanguage.French,
              onTap: () => _selectLanguage(AppLanguage.French),
              style: optionStyle,
              baseSize: baseSize,
            ),
            SizedBox(width: baseSize * 0.02),
            OptionButton(
              label: i18n.translate(LANGUAGE_EN_LABEL),
              isActive: currentLanguage == AppLanguage.English,
              onTap: () => _selectLanguage(AppLanguage.English),
              style: optionStyle,
              baseSize: baseSize,
            ),
          ],
        ),
        SizedBox(height: baseSize * 0.03),
        Text(i18n.translate(THEME_LABEL), style: labelStyle),
        SizedBox(height: baseSize * 0.015),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            OptionButton(
              label: i18n.translate(THEME_DEFAULT_LABEL),
              isActive: currentTheme == AppTheme.DefaultTheme,
              onTap: () => _selectTheme(AppTheme.DefaultTheme),
              style: optionStyle,
              baseSize: baseSize,
            ),
            SizedBox(width: baseSize * 0.02),
            OptionButton(
              label: i18n.translate(THEME_DARK_LABEL),
              isActive: currentTheme == AppTheme.Dark,
              onTap: () => _selectTheme(AppTheme.Dark),
              style: optionStyle,
              baseSize: baseSize,
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);

    final dialogHeight = baseSize * 0.75;
    final dialogWidth = dialogHeight * 9 / 10;
    final contentPadding = baseSize * 0.055;

    final titleStyle = _pixelTextStyle(baseSize * 0.05);
    final labelStyle = _pixelTextStyle(baseSize * 0.035);
    final tabStyle = _pixelTextStyle(baseSize * 0.025);
    final optionStyle = _pixelTextStyle(baseSize * 0.025);

    final sliderWidth = dialogWidth * 0.6;
    final sliderHeight = baseSize * 0.045;

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: widget.onClose,
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: BLUR_SIGMA, sigmaY: BLUR_SIGMA),
              child: Container(color: Colors.black.withValues(alpha: OVERLAY_ALPHA)),
            ),
          ),
        ),
        Center(
          child: Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: (_) {},
            child: SizedBox(
              height: dialogHeight,
              width: dialogWidth,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(CONTAINER_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  Padding(
                    padding: EdgeInsets.all(contentPadding),
                    child: Column(
                      children: [
                        SizedBox(
                          height: baseSize * 0.06,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(i18n.translate(TITLE_TEXT), style: titleStyle),
                              SettingsTabBar(
                                selectedTab: _selectedTab,
                                onTabSelected: (tab) => setState(() => _selectedTab = tab),
                                tabStyle: tabStyle,
                                audioLabel: i18n.translate(AUDIO_TAB_LABEL),
                                preferencesLabel: i18n.translate(PREFERENCES_TAB_LABEL),
                                baseSize: baseSize,
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: _selectedTab == SettingsTab.audio
                              ? _buildAudioTab(i18n, labelStyle, sliderWidth, sliderHeight)
                              : _buildPreferencesTab(i18n, labelStyle, optionStyle, baseSize),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
