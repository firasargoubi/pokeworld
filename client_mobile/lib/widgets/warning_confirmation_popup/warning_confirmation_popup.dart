import 'dart:math';

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/widgets/cut_out_button/cut_out_button.dart';
import 'package:client_mobile/widgets/default_container/default_container.dart';
import 'package:flutter/material.dart';

import 'warning_confirmation_popup_const.dart';

class WarningConfirmationPopup extends StatelessWidget {
  const WarningConfirmationPopup({
    required this.message,
    required this.onClosed,
    this.hasCloseButton = false,
    this.isConfirmation = false,
    this.popupColor = PopupColor.Orange,
    super.key,
  });

  final String message;
  final bool hasCloseButton;
  final bool isConfirmation;
  final PopupColor popupColor;
  final ValueChanged<bool> onClosed;

  DefaultContainerConfig get _cardConfig {
    switch (popupColor) {
      case PopupColor.Orange:
        return ORANGE_CONTAINER_CONFIG;
      case PopupColor.Blue:
        return BLUE_CONTAINER_CONFIG;
      case PopupColor.Green:
        return GREEN_CONTAINER_CONFIG;
    }
  }

  TextStyle _label(double b) => TextStyle(
    fontFamily: PIXEL_FONT,
    color: Colors.white,
    fontSize: b * 0.035,
    height: 0.9,
    shadows: [Shadow(offset: Offset(b * 0.004, 0), color: SHADOW_COLOR, blurRadius: 0)],
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

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);
    return Material(
      color: Colors.transparent,
      child: Center(
        child: Padding(
          padding: EdgeInsets.all(baseSize * 0.03),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: baseSize * 0.9),
            child: Stack(
              children: [
                Positioned.fill(
                  child: DefaultContainer(baseSize: baseSize, config: _cardConfig),
                ),
                Padding(
                  padding: EdgeInsets.only(top: baseSize * 0.05, bottom: baseSize * 0.04, left: baseSize * 0.08, right: baseSize * 0.08),
                  child: Column(
                    children: <Widget>[
                      Text(message, textAlign: TextAlign.center, style: _label(baseSize)),
                      SizedBox(height: baseSize * 0.07),
                      if (isConfirmation)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: <Widget>[
                            SizedBox(
                              width: baseSize * 0.12,
                              height: baseSize * 0.06,
                              child: CutOutButton(
                                lightColor: RED_BUTTON_LIGHT_COLOR,
                                mainColor: RED_BUTTON_MAIN_COLOR,
                                darkColor: RED_BUTTON_DARK_COLOR,
                                onAction: () => {onClosed(false), AudioService().playSoundEffect(SoundEffect.Select.path)},
                                child: Icon(Icons.close, color: Colors.white, size: baseSize * 0.035),
                              ),
                            ),
                            SizedBox(width: baseSize * 0.05),
                            SizedBox(
                              width: baseSize * 0.12,
                              height: baseSize * 0.06,
                              child: CutOutButton(
                                lightColor: GREEN_BUTTON_LIGHT_COLOR,
                                mainColor: GREEN_BUTTON_MAIN_COLOR,
                                darkColor: GREEN_BUTTON_DARK_COLOR,
                                onAction: () => {onClosed(true), AudioService().playSoundEffect(SoundEffect.Select.path)},
                                child: Icon(Icons.check, color: Colors.white, size: baseSize * 0.035),
                              ),
                            ),
                          ],
                        )
                      else if (hasCloseButton)
                        SizedBox(
                          width: baseSize * 0.12,
                          height: baseSize * 0.06,
                          child: CutOutButton(
                            lightColor: RED_BUTTON_LIGHT_COLOR,
                            mainColor: RED_BUTTON_MAIN_COLOR,
                            darkColor: RED_BUTTON_DARK_COLOR,
                            onAction: () => {onClosed(false), AudioService().playSoundEffect(SoundEffect.Select.path)},
                            child: Icon(Icons.close, color: Colors.white, size: baseSize * 0.035),
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
    );
  }
}
