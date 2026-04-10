import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/default_container/default_container.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

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
    entryFee: MatchService().matchData?.lobbyData.entryFee ?? 0,
  );

  @override
  State<PreMatchSettingsPopup> createState() => _PreMatchSettingsPopupState();
}

class _PreMatchSettingsPopupState extends State<PreMatchSettingsPopup> {
  late bool _isFriendOnly;
  late int _entryFee;
  late final TextEditingController _entryFeeController;
  MatchSettings get matchSettings =>
      MatchSettings(isDropInEnabled: false, isElementalMode: false, isRapidElimination: false, entryFee: _entryFee, isFriendOnly: _isFriendOnly);

  int get _maxEntryFee {
    final balance = UserService().currentUser.value?.balance ?? 0;
    return max(0, balance.toInt());
  }

  @override
  void initState() {
    super.initState();
    _entryFeeController = TextEditingController();
    _synchronizeSettings();
  }

  @override
  void dispose() {
    _entryFeeController.dispose();
    super.dispose();
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

  void _synchronizeSettings() {
    _isFriendOnly = MatchService().matchData?.lobbyData.isFriendOnly ?? false;
    _entryFee = _setMaxFee(MatchService().matchData?.lobbyData.entryFee ?? 0);
    _entryFeeController.text = _entryFee.toString();
  }

  int _setMaxFee(int value) {
    return min(_maxEntryFee, max(0, value));
  }

  void _setEntryFee(String value) {
    final parsedValue = int.tryParse(value) ?? 0;
    setState(() {
      _entryFee = _setMaxFee(parsedValue);
      _entryFeeController.text = _entryFee.toString();
      _entryFeeController.selection = TextSelection.fromPosition(TextPosition(offset: _entryFeeController.text.length));
    });
  }

  void _incrementEntryFee() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    setState(() {
      _entryFee = _setMaxFee(_entryFee + ENTRY_FEE_STEP);
      _entryFeeController.text = _entryFee.toString();
    });
  }

  void _decrementEntryFee() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    setState(() {
      _entryFee = _setMaxFee(_entryFee - ENTRY_FEE_STEP);
      _entryFeeController.text = _entryFee.toString();
    });
  }

  void submit() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    widget.onSettingsSelected(matchSettings);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
        final screenWidth = constraints.maxWidth;
        final screenHeight = max(1.0, constraints.maxHeight - keyboardHeight);
        final baseSize = _computeBaseSize(Size(screenWidth, screenHeight));

        final dialogHeight = baseSize * 0.72;
        final dialogWidth = baseSize * 0.97;
        final contentPadding = baseSize * 0.055;

        final titleStyle = _pixelTextStyle(baseSize * 0.06);
        final labelStyle = _pixelTextStyle(baseSize * 0.035);
        final optionStyle = _pixelTextStyle(baseSize * 0.035);
        final inputStyle = _pixelTextStyle(baseSize * 0.03);

        final i18n = I18nService();

        return Padding(
          padding: EdgeInsets.only(bottom: keyboardHeight),
          child: Stack(
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
                                            SizedBox(height: sectionHeight * 0.10),
                                            Row(
                                              children: [
                                                Text(i18n.translate(PRICE_KEY), style: labelStyle),
                                                SizedBox(width: sectionHeight * 0.10),
                                                Expanded(
                                                  child: Row(
                                                    children: [
                                                      _FeeButton(text: '-', style: optionStyle, onTap: _decrementEntryFee),
                                                      SizedBox(width: sectionHeight * 0.03),
                                                      SizedBox(
                                                        width: sectionHeight * 0.30,
                                                        child: Container(
                                                          padding: EdgeInsets.symmetric(horizontal: sectionHeight * 0.03),
                                                          decoration: BoxDecoration(
                                                            border: Border.all(
                                                              color: Colors.white,
                                                              width: max(1, (optionStyle.fontSize ?? 1) * 0.08),
                                                            ),
                                                          ),
                                                          child: Material(
                                                            type: MaterialType.transparency,
                                                            child: TextField(
                                                              controller: _entryFeeController,
                                                              keyboardType: TextInputType.number,
                                                              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                                              style: inputStyle,
                                                              onChanged: _setEntryFee,
                                                              textAlign: TextAlign.center,
                                                              decoration: const InputDecoration(
                                                                border: InputBorder.none,
                                                                isDense: true,
                                                                contentPadding: EdgeInsets.symmetric(vertical: 8),
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(width: sectionHeight * 0.03),
                                                      _FeeButton(text: '+', style: optionStyle, onTap: _incrementEntryFee),
                                                    ],
                                                  ),
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
          ),
        );
      },
    );
  }
}

class _FeeButton extends StatelessWidget {
  const _FeeButton({required this.text, required this.style, required this.onTap});

  final String text;
  final TextStyle style;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final height = (style.fontSize ?? 16) * 1.35;
    final width = height * 1.70;
    final cutout = max(1.0, height * 0.10);

    const grayPixelGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFFD0D0D0), Color(0xFFD0D0D0), Color(0xFFA0A0A0), Color(0xFFA0A0A0), Color(0xFF606060), Color(0xFF606060)],
      stops: [0.0, 0.08, 0.08, 0.90, 0.90, 1.0],
    );

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: SizedBox(
        width: width,
        height: height,
        child: Row(
          children: [
            Container(
              width: cutout,
              height: height - cutout * 2,
              decoration: const BoxDecoration(gradient: grayPixelGradient),
            ),
            Expanded(
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: grayPixelGradient,
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.25), offset: Offset(0, max(1.0, cutout * 0.55)), blurRadius: 0)],
                ),
                child: Text(text, style: style),
              ),
            ),
            Container(
              width: cutout,
              height: height - cutout * 2,
              decoration: const BoxDecoration(gradient: grayPixelGradient),
            ),
          ],
        ),
      ),
    );
  }
}
