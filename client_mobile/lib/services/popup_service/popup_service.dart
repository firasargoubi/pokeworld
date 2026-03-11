import 'dart:async';

import 'package:client_mobile/consts/popup_messages_const.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:flutter/foundation.dart';

class PopupService {
  static final PopupService _instance = PopupService._internal();
  factory PopupService() => _instance;
  PopupService._internal({Duration popupDelay = const Duration(seconds: POPUP_DELAY_IN_SECONDS)}) : _popupDelay = popupDelay;

  final Duration _popupDelay;
  final List<PopupMessage> _messages = <PopupMessage>[];

  final ValueNotifier<List<PopupMessage>> activePopups = ValueNotifier<List<PopupMessage>>(<PopupMessage>[]);

  bool _keepMessagesOnNavigation = false;

  void showPopup(PopupMessage popupMessage) {
    final List<String> containedKeyword = KEYWORDS_TO_REPLACE
        .where((keyword) => popupMessage.message.toLowerCase().contains(keyword.toLowerCase()))
        .toList(growable: false);

    if (containedKeyword.isNotEmpty) {
      removeMessagesByFilter((message) => containedKeyword.any((keyword) => message.toLowerCase().contains(keyword.toLowerCase())));
    }

    _messages.add(popupMessage);
    _displayPopup();
  }

  void clearMessages() {
    _messages.clear();
    activePopups.value = <PopupMessage>[];
  }

  void keepMessages() {
    _keepMessagesOnNavigation = true;
  }

  void clearOnNavigation() {
    if (!_keepMessagesOnNavigation) {
      clearMessages();
    }
    _keepMessagesOnNavigation = false;
  }

  void removeMessagesByFilter(bool Function(String message) filterFn) {
    _messages.removeWhere((popup) => filterFn(popup.message));
    activePopups.value = activePopups.value.where((popup) => !filterFn(popup.message)).toList(growable: false);
  }

  void handlePopupClose({required PopupMessage message, required bool confirmed}) {
    if (message.isConfirmation && confirmed) {
      message.action?.call();
    }

    final updatedPopups = List<PopupMessage>.from(activePopups.value)..remove(message);
    activePopups.value = updatedPopups;
  }

  void _displayPopup() {
    final PopupMessage? currentMessage = _messages.isNotEmpty ? _messages.removeAt(0) : null;
    if (currentMessage == null) {
      return;
    }

    activePopups.value = <PopupMessage>[...activePopups.value, currentMessage];

    if (!currentMessage.isConfirmation) {
      unawaited(
        Future<void>.delayed(_popupDelay, () {
          if (activePopups.value.contains(currentMessage)) {
            handlePopupClose(message: currentMessage, confirmed: false);
          }
        }),
      );
    }
  }
}
