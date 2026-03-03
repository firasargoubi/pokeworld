import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/lobby_service/lobby_service.dart';
import 'package:client_mobile/widgets/poke_button.dart';
import 'package:flutter/material.dart';

import 'add_bot_popup_const.dart';
import 'add_bot_popup_widgets.dart';

class AddBotPopup extends StatefulWidget {
  const AddBotPopup({super.key, required this.controller, required this.onClose, this.initialIsAggressive = true});

  final TextEditingController controller;
  final VoidCallback onClose;
  final bool initialIsAggressive;

  @override
  State<AddBotPopup> createState() => _AddBotPopupState();
}

class _AddBotPopupState extends State<AddBotPopup> {
  late bool _isAggressive;

  @override
  void initState() {
    super.initState();
    _isAggressive = widget.initialIsAggressive;
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

  void _setMode(bool aggressive) {
    if (_isAggressive == aggressive) return;
    setState(() => _isAggressive = aggressive);
  }

  void submit() {
    final PlayerType playerType = _isAggressive ? PlayerType.botAggressive : PlayerType.botDefensive;
    LobbyService().addBot(playerType);
    widget.onClose();
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);

    final dialogHeight = baseSize * 0.50;
    final dialogWidth = dialogHeight * 16 / 9;
    final contentPadding = baseSize * 0.055;

    final titleStyle = _pixelTextStyle(baseSize * 0.05);

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
                          flex: 3,
                          child: Center(child: Text(TITLE_TEXT, style: titleStyle)),
                        ),
                        Expanded(
                          flex: 3,
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              final sectionHeight = constraints.maxHeight;

                              final optionFontSize = sectionHeight * 0.40;
                              final optionStyle = _pixelTextStyle(optionFontSize);

                              final checkboxSize = optionFontSize * 0.95;
                              final checkboxInnerPadding = checkboxSize * 0.10;
                              final labelGap = optionFontSize * 0.35;
                              final optionsGap = optionFontSize * 1.20;

                              return Center(
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    ModeOption(
                                      text: AGGRESSIVE_TEXT,
                                      selected: _isAggressive,
                                      checkboxSize: checkboxSize,
                                      checkboxInnerPadding: checkboxInnerPadding,
                                      labelGap: labelGap,
                                      style: optionStyle,
                                      onTap: () => _setMode(true),
                                    ),
                                    SizedBox(width: optionsGap),
                                    ModeOption(
                                      text: DEFENSIVE_TEXT,
                                      selected: !_isAggressive,
                                      checkboxSize: checkboxSize,
                                      checkboxInnerPadding: checkboxInnerPadding,
                                      labelGap: labelGap,
                                      style: optionStyle,
                                      onTap: () => _setMode(false),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Center(
                            child: SizedBox(
                              width: baseSize * 0.35,
                              height: baseSize * 0.20,
                              child: PokeButton(text: ADD_BUTTON_TEXT, onTap: submit),
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
