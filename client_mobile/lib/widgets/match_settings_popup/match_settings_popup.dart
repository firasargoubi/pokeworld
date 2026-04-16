import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/lobby_service/lobby_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/widgets/default_container/default_container.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
import 'package:flutter/material.dart';

import 'match_settings_popup_const.dart';
import 'match_settings_popup_widgets.dart';

class MatchSettingsPopup extends StatefulWidget {
  const MatchSettingsPopup({super.key, required this.onClose});

  final VoidCallback onClose;

  MatchSettings get initialMatchSettings => MatchSettings(
    isDropInEnabled: MatchService().matchData?.lobbyData.isDropInEnabled ?? false,
    isElementalMode: MatchService().matchData?.playData.isElementalMode ?? false,
    isRapidElimination: MatchService().matchData?.lobbyData.isRapidElimination ?? false,
    entryFee: MatchService().matchData?.lobbyData.entryFee ?? 0,
    isFriendOnly: MatchService().matchData?.lobbyData.isFriendOnly ?? false,
  );

  @override
  State<MatchSettingsPopup> createState() => _MatchSettingsPopupState();
}

class _MatchSettingsPopupState extends State<MatchSettingsPopup> {
  late bool _isDropIn;
  late bool _isElemental;
  late bool _isRapidElimination;
  late bool _isFriendOnly;
  late int _entryFee;
  MatchSettings get matchSettings => MatchSettings(
    isDropInEnabled: _isDropIn,
    isElementalMode: _isElemental,
    isRapidElimination: _isRapidElimination,
    entryFee: _entryFee,
    isFriendOnly: _isFriendOnly,
  );

  @override
  void initState() {
    super.initState();

    _isDropIn = widget.initialMatchSettings.isDropInEnabled;
    _isElemental = widget.initialMatchSettings.isElementalMode;
    _isRapidElimination = widget.initialMatchSettings.isRapidElimination;
    _entryFee = widget.initialMatchSettings.entryFee;
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

  void _toggleDropIn() {
    setState(() {
      _isDropIn = !_isDropIn;
    });
  }

  void _toggleElemental() {
    setState(() {
      _isElemental = !_isElemental;
    });
  }

  void _toggleRapidElimination() {
    setState(() {
      _isRapidElimination = !_isRapidElimination;
    });
  }

  void submit() {
    LobbyService().changeMatchSettings(matchSettings);
    widget.onClose();
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);

    final dialogHeight = baseSize * 0.8;
    final dialogWidth = dialogHeight * 11 / 10;
    final contentPadding = baseSize * 0.055;

    final titleStyle = _pixelTextStyle(baseSize * 0.05);

    final i18n = I18nService();

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: widget.onClose,
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
              child: Container(color: Colors.black54),
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
                  DefaultContainer(baseSize: baseSize, config: GRAY_CONTAINER_CONFIG, onClose: () => widget.onClose()),
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

                              final optionFontSize = sectionHeight * 0.13;
                              final optionStyle = _pixelTextStyle(optionFontSize);

                              final checkboxSize = optionFontSize * 0.95;
                              final checkboxInnerPadding = checkboxSize * 0.10;
                              final labelGap = optionFontSize * 0.35;
                              final optionsGap = optionFontSize * 0.90;

                              return Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    MatchSettingOption(
                                      text: i18n.translate(DROPIN_KEY),
                                      iconAsset: DROP_ICON_ASSET,
                                      selected: _isDropIn,
                                      checkboxSize: checkboxSize,
                                      checkboxInnerPadding: checkboxInnerPadding,
                                      labelGap: labelGap,
                                      style: optionStyle,
                                      onTap: _toggleDropIn,
                                    ),
                                    SizedBox(height: optionsGap),
                                    MatchSettingOption(
                                      text: i18n.translate(ELEMENTAL_KEY),
                                      iconAsset: ELEMENTAL_ICON_ASSET,
                                      selected: _isElemental,
                                      checkboxSize: checkboxSize,
                                      checkboxInnerPadding: checkboxInnerPadding,
                                      labelGap: labelGap,
                                      style: optionStyle,
                                      onTap: _toggleElemental,
                                    ),
                                    SizedBox(height: optionsGap),
                                    MatchSettingOption(
                                      text: i18n.translate(RAPID_ELIMINATION_KEY),
                                      iconAsset: RAPID_ELIMINATION_ICON_ASSET,
                                      selected: _isRapidElimination,
                                      checkboxSize: checkboxSize,
                                      checkboxInnerPadding: checkboxInnerPadding,
                                      labelGap: labelGap,
                                      style: optionStyle,
                                      onTap: _toggleRapidElimination,
                                    ),
                                  ],
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
                              child: PokeButton(text: i18n.translate(APPLY_BUTTON_KEY).toUpperCase(), onTap: submit),
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
