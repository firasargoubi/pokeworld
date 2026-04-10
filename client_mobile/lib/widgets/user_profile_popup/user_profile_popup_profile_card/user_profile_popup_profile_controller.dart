import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/chat_service/chat_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/tutorial_popup/tutorial_popup.dart';
import 'package:client_mobile/widgets/tutorial_popup/tutorial_popup_controller.dart';
// ignore: implementation_imports
import 'package:flutter/src/widgets/framework.dart';

class ProfileController {
  String _translateError(Object error) {
    if (error is AuthException) {
      switch (error.error) {
        case AuthError.usernameExists:
          return I18nService().translate(ErrorMessage.UsernameExists.message);
        case AuthError.invalidCredentials:
          return I18nService().translate(ErrorMessage.InvalidCredentials.message);
        case AuthError.userNotFound:
          return I18nService().translate(ErrorMessage.UserNotFound.message);
        case AuthError.alreadyConnected:
          return I18nService().translate(ErrorMessage.AlreadyConnected.message);
      }
    }

    final rawMessage = switch (error) {
      StateError(:final message) => message,
      _ => error.toString(),
    };
    final normalizedMessage = rawMessage.replaceFirst('Exception: ', '').replaceFirst('Bad state: ', '').trim();
    final translatedMessage = I18nService().translate(normalizedMessage);
    return translatedMessage == normalizedMessage ? normalizedMessage : translatedMessage;
  }

  void _showErrorPopup(Object error) {
    PopupService().showPopup(PopupMessage(message: _translateError(error), hasCloseButton: true, isConfirmation: false));
  }

  Future<void> _handleLogout() async {
    try {
      await UserService().logout();
      await PreferencesService().setThemeBeforeAuth(AppTheme.DefaultTheme);
      ChatService().clearChatHistory();
    } catch (e) {
      _showErrorPopup(e);
    }
  }

  void showLogoutConfirmation() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    PopupService().showPopup(
      PopupMessage(
        message: I18nService().translate(PopupMessages.LogoutConfirmation.messageKey),
        hasCloseButton: true,
        isConfirmation: true,
        action: () => _handleLogout(),
      ),
    );
  }

  void showTutorial(BuildContext context) {
    showTutorialPopup(context);
  }

  void resetTutorial() {
    PopupService().showPopup(
      PopupMessage(
        message: I18nService().translate(PopupMessages.ResetTutorialConfirmation.messageKey),
        hasCloseButton: true,
        isConfirmation: true,
        action: () => TutorialPopupController().goToStep(0),
      ),
    );
  }
}
