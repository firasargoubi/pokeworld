import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
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

  Color get _cardColor {
    return popupColor == PopupColor.Orange ? WARNING_CONFIRMATION_POPUP_ORANGE_COLOR : WARNING_CONFIRMATION_POPUP_BLUE_COLOR;
  }

  TextStyle get _textStyle {
    return const TextStyle(color: WARNING_CONFIRMATION_POPUP_TEXT_COLOR, fontSize: WARNING_CONFIRMATION_POPUP_TEXT_SIZE);
  }

  TextStyle get _buttonTextStyle {
    return const TextStyle(color: WARNING_CONFIRMATION_POPUP_TEXT_COLOR);
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: WARNING_CONFIRMATION_POPUP_MAX_WIDTH),
          child: Card(
            color: _cardColor,
            margin: const EdgeInsets.all(WARNING_CONFIRMATION_POPUP_MARGIN),
            child: Padding(
              padding: const EdgeInsets.all(WARNING_CONFIRMATION_POPUP_PADDING),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(message, textAlign: TextAlign.center, style: _textStyle),
                  const SizedBox(height: WARNING_CONFIRMATION_POPUP_PADDING),
                  if (isConfirmation)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        TextButton(
                          onPressed: () => {onClosed(true), AudioService().playSoundEffect(SoundEffect.Select.path)},
                          child: Text(WARNING_CONFIRMATION_POPUP_CONFIRM_TEXT, style: _buttonTextStyle),
                        ),
                        const SizedBox(width: WARNING_CONFIRMATION_POPUP_BUTTON_SPACING),
                        TextButton(
                          onPressed: () => {onClosed(false), AudioService().playSoundEffect(SoundEffect.Select.path)},
                          child: Text(WARNING_CONFIRMATION_POPUP_CANCEL_TEXT, style: _buttonTextStyle),
                        ),
                      ],
                    )
                  else if (hasCloseButton)
                    TextButton(
                      onPressed: () => {onClosed(false), AudioService().playSoundEffect(SoundEffect.Select.path)},
                      child: Text(WARNING_CONFIRMATION_POPUP_CLOSE_TEXT, style: _buttonTextStyle),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
