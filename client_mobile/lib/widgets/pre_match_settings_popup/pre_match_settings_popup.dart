import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/widgets/default_container/default_container.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
import 'package:flutter/material.dart';

import 'pre_match_settings_popup_const.dart';
import 'pre_match_settings_popup_widgets.dart';

class PreMatchSettingsPopup extends StatefulWidget {
  const PreMatchSettingsPopup({super.key, required this.onSettingsSelected});

  final Function(MatchSettings) onSettingsSelected;

  MatchSettings get initialMatchSettings => MatchSettings(
    isDropInEnabled: false,
    isElementalMode: false,
    isRapidElimination: false,
    isFriendOnly: MatchService().matchData?.lobbyData.isFriendOnly ?? false,
  );

  @override
  State<PreMatchSettingsPopup> createState() => _PreMatchSettingsPopupState();
}

class _PreMatchSettingsPopupState extends State<PreMatchSettingsPopup> {
  late bool _isFriendOnly;

  MatchSettings get matchSettings =>
      MatchSettings(isDropInEnabled: false, isElementalMode: false, isRapidElimination: false, isFriendOnly: _isFriendOnly);

  @override
  void initState() {
    super.initState();
    _isFriendOnly = widget.initialMatchSettings.isFriendOnly;
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

  void _setFriendOnly(bool value) {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    setState(() {
      _isFriendOnly = value;
    });
  }

  void submit() {
    widget.onSettingsSelected(matchSettings);
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);
    final dialogHeight = baseSize * 0.72;
    final dialogWidth = baseSize * 0.97;
    final contentPadding = baseSize * 0.055;

    final titleStyle = _pixelTextStyle(baseSize * 0.06);
    final labelStyle = _pixelTextStyle(baseSize * 0.035);
    final optionStyle = _pixelTextStyle(baseSize * 0.035);

    final i18n = I18nService();

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => Navigator.of(context).pop(),
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
                  DefaultContainer(baseSize: baseSize, config: GRAY_CONTAINER_CONFIG, onClose: () => Navigator.of(context).pop()),
                  Padding(
                    padding: EdgeInsets.all(contentPadding),
                    child: Column(
                      children: [
                        Expanded(
                          flex: 1,
                          child: Center(
                            child: Text(i18n.translate(TITLE_KEY), style: titleStyle, textAlign: TextAlign.center),
                          ),
                        ),
                        Expanded(
                          flex: 5,
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              final sectionHeight = constraints.maxHeight;

                              return Center(
                                child: SingleChildScrollView(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(i18n.translate(ACCESSIBILITY_KEY), style: labelStyle),
                                          PreMatchSettingsOptionButton(
                                            text: i18n.translate(OPEN_KEY),
                                            selected: !_isFriendOnly,
                                            hasIcon: true,
                                            iconAsset: OPEN_ICON_ASSET,
                                            style: optionStyle,
                                            onTap: () => _setFriendOnly(false),
                                          ),
                                          SizedBox(width: sectionHeight * 0),
                                          PreMatchSettingsOptionButton(
                                            text: i18n.translate(FRIEND_ONLY_KEY),
                                            selected: _isFriendOnly,
                                            hasIcon: true,
                                            iconAsset: FRIEND_ONLY_ICON_ASSET,
                                            style: optionStyle,
                                            onTap: () => _setFriendOnly(true),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Center(
                            child: SizedBox(
                              width: baseSize * 0.40,
                              height: baseSize * 0.15,
                              child: PokeButton(text: i18n.translate(VALIDATE_KEY).toUpperCase(), onTap: submit),
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
