import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
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

  @override
  void initState() {
    super.initState();
    _musicVolume = AudioService().backgroundVolume.value;
    _effectsVolume = AudioService().effectsVolume.value;

    // Listen to changes from AudioService
    AudioService().backgroundVolume.addListener(_onMusicVolumeChanged);
    AudioService().effectsVolume.addListener(_onEffectsVolumeChanged);
  }

  @override
  void dispose() {
    AudioService().backgroundVolume.removeListener(_onMusicVolumeChanged);
    AudioService().effectsVolume.removeListener(_onEffectsVolumeChanged);
    super.dispose();
  }

  void _onMusicVolumeChanged() {
    if (mounted) {
      setState(() {
        _musicVolume = AudioService().backgroundVolume.value;
      });
    }
  }

  void _onEffectsVolumeChanged() {
    if (mounted) {
      setState(() {
        _effectsVolume = AudioService().effectsVolume.value;
      });
    }
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

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);

    final dialogHeight = baseSize * 0.55;
    final dialogWidth = dialogHeight * 16 / 9;
    final contentPadding = baseSize * 0.055;

    final titleStyle = _pixelTextStyle(baseSize * 0.05);
    final labelStyle = _pixelTextStyle(baseSize * 0.035);

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
                        Expanded(
                          flex: 2,
                          child: Center(child: Text(TITLE_TEXT, style: titleStyle)),
                        ),
                        Expanded(
                          flex: 3,
                          child: Center(
                            child: VolumeSlider(
                              label: MUSIC_LABEL,
                              value: _musicVolume,
                              onChanged: _onMusicVolumeChange,
                              labelStyle: labelStyle,
                              sliderWidth: sliderWidth,
                              sliderHeight: sliderHeight,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Center(
                            child: VolumeSlider(
                              label: EFFECTS_LABEL,
                              value: _effectsVolume,
                              onChanged: _onEffectsVolumeChange,
                              labelStyle: labelStyle,
                              sliderWidth: sliderWidth,
                              sliderHeight: sliderHeight,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Center(
                            child: SizedBox(
                              width: baseSize * 0.35,
                              height: baseSize * 0.18,
                              child: PokeButton(text: CLOSE_BUTTON_TEXT, onTap: widget.onClose),
                            ),
                          ),
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
