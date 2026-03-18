import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/consts/avatar_list.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:flutter/material.dart';

import '../consts/login_const.dart';
import '../widgets/login_popup/login_popup_consts.dart';

class LoginController {
  final UserService _userService = UserService();
  final PreferencesService _preferencesService = PreferencesService();
  final PopupService _popupService = PopupService();

  bool isRegister = false;
  bool isLoading = false;
  String? errorMessage;
  String selectedAvatar = USER_PROFILE_PICTURES.first;

  AppLanguage get currentLanguage => _preferencesService.currentLanguage.value;
  String get selectedFullAvatar {
    final index = USER_PROFILE_PICTURES.indexOf(selectedAvatar);
    if (index != -1 && index < USER_FULL_PROFILE_PICTURES.length) {
      return USER_FULL_PROFILE_PICTURES[index];
    }
    return selectedAvatar;
  }

  final TextEditingController usernameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  Function(void Function())? _setState;

  String _translateError(String messageOrKey) {
    final translated = I18nService().translate(messageOrKey);
    return translated == messageOrKey ? messageOrKey : translated;
  }

  void init(Function(void Function()) setState) {
    _setState = setState;
  }

  Future<void> handleSubmit({required Function() onSuccess}) async {
    final rawUsername = usernameController.text.toUpperCase();
    final trimmedUsername = rawUsername.trim();
    final rawEmail = emailController.text;
    final trimmedEmail = rawEmail.trim();
    final rawPassword = passwordController.text;
    final trimmedPassword = rawPassword.trim();

    final hasEmptyUsername = rawUsername.isEmpty;
    final hasEmptyPassword = rawPassword.isEmpty;
    final hasEmptyEmailOrConfirm = isRegister && (rawEmail.isEmpty || confirmPasswordController.text.isEmpty);

    if (hasEmptyUsername || hasEmptyPassword || hasEmptyEmailOrConfirm) {
      _updateState(() {
        errorMessage = _translateError(ErrorMessage.EmptyFields.message);
      });
      return;
    }

    if (isRegister) {
      final isValid = registerChecks(rawUsername, trimmedUsername, rawEmail, trimmedEmail, rawPassword, trimmedPassword);
      if (!isValid) {
        return;
      }
    }

    _updateState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      if (isRegister) {
        await _userService.register(
          rawUsername,
          rawEmail,
          rawPassword,
          selectedAvatar,
          selectedFullAvatar,
          preferences: UserPreferences(language: _preferencesService.currentLanguage.value, theme: _preferencesService.currentTheme.value),
        );
        _popupService.showPopup(
          PopupMessage(
            message: I18nService().translate(PopupMessages.SuccessfulAccountCreation.messageKey),
            hasCloseButton: true,
            isConfirmation: false,
          ),
        );
      } else {
        await _userService.login(rawUsername, rawPassword);
        _preferencesService.syncPreferencesFromUser();
        final i18n = I18nService();
        await i18n.use(_preferencesService.currentLanguage.value);
        _popupService.showPopup(
          PopupMessage(message: i18n.translate(PopupMessages.SuccessfulConnection.messageKey), hasCloseButton: true, isConfirmation: false),
        );
      }
      onSuccess();
    } catch (e) {
      String message;
      if (e is AuthException) {
        switch (e.error) {
          case AuthError.usernameExists:
            message = _translateError(ErrorMessage.UsernameExists.message);
            break;
          case AuthError.invalidCredentials:
            message = _translateError(ErrorMessage.InvalidCredentials.message);
            break;
          case AuthError.userNotFound:
            message = _translateError(ErrorMessage.UserNotFound.message);
            break;
          case AuthError.alreadyConnected:
            message = _translateError(ErrorMessage.AlreadyConnected.message);
            break;
        }
      } else {
        final errorText = e.toString();
        final errorPrefix = _translateError(isRegister ? ErrorMessage.RegistrationFailed.message : ErrorMessage.LoginFailed.message);
        message = '$errorPrefix $errorText';
      }

      _updateState(() {
        errorMessage = message;
        isLoading = false;
      });
    }
  }

  bool registerChecks(String rawUsername, String trimmedUsername, String rawEmail, String trimmedEmail, String rawPassword, String trimmedPassword) {
    if (rawUsername != trimmedUsername) {
      _updateState(() {
        errorMessage = _translateError(ErrorMessage.UsernameStartsOrEndsWithSpaces.message);
      });
      return false;
    }

    if (rawPassword.isNotEmpty && trimmedPassword.isEmpty) {
      _updateState(() {
        errorMessage = _translateError(ErrorMessage.PasswordOnlySpaces.message);
      });
      return false;
    }

    if (rawPassword != confirmPasswordController.text) {
      _updateState(() {
        errorMessage = _translateError(LOGIN_POPUP_PASSWORD_MISMATCH);
      });
      return false;
    }

    if (rawEmail != trimmedEmail || !RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(trimmedEmail)) {
      _updateState(() {
        errorMessage = _translateError(ErrorMessage.InvalidEmail.message);
      });
      return false;
    }

    if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
      _updateState(() {
        errorMessage = _translateError(ErrorMessage.ShortUsername.message);
      });
      return false;
    }
    return true;
  }

  void toggleRegister() {
    _updateState(() {
      isRegister = !isRegister;
      errorMessage = null;
      confirmPasswordController.clear();
    });
  }

  void selectAvatar(String avatarPath) {
    _updateState(() {
      selectedAvatar = avatarPath;
    });
  }

  Future<void> selectLanguage(AppLanguage language) async {
    try {
      await _preferencesService.setLanguage(language);
      _updateState(() {
        errorMessage = null;
      });
    } catch (_) {
      _updateState(() {
        errorMessage = _translateError(ErrorMessage.RegistrationFailed.message);
      });
    }
  }

  void _updateState(void Function() callback) {
    if (_setState != null) {
      _setState!(() {
        callback();
      });
    }
  }

  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    confirmPasswordController.dispose();
    passwordController.dispose();
  }
}
