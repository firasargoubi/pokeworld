import 'package:client_mobile/models/popup_message.dart';
import 'package:flutter/material.dart';

class WarningConfirmationPopup extends StatelessWidget {
  const WarningConfirmationPopup({
    required this.message,
    required this.onClosed,
    this.hasCloseButton = false,
    this.isConfirmation = false,
    this.popupColor = PopupColor.orange,
    super.key,
  });

  final String message;
  final bool hasCloseButton;
  final bool isConfirmation;
  final PopupColor popupColor;
  final ValueChanged<bool> onClosed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 360),
          child: Card(
            color: popupColor == PopupColor.orange ? Colors.orange : Colors.blue,
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  if (isConfirmation)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        TextButton(
                          onPressed: () => onClosed(true),
                          child: const Text('Confirm', style: TextStyle(color: Colors.white)),
                        ),
                        const SizedBox(width: 8),
                        TextButton(
                          onPressed: () => onClosed(false),
                          child: const Text('Annuler', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    )
                  else if (hasCloseButton)
                    TextButton(
                      onPressed: () => onClosed(false),
                      child: const Text('Fermer', style: TextStyle(color: Colors.white)),
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
