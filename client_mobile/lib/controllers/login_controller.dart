import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/consts/avatar_list.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:flutter/material.dart';

import '../consts/login_const.dart';

class LoginController {
  final UserService _userService = UserService();
  final PopupService _popupService = PopupService();

  bool isRegister = false;
  bool isLoading = false;
  String? errorMessage;
  String selectedAvatar = USER_PROFILE_PICTURES.first;
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

  Function(void Function())? _setState;

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

    if (rawUsername.isEmpty || rawPassword.isEmpty || (isRegister && rawEmail.isEmpty)) {
      _updateState(() {
        errorMessage = ErrorMessage.EmptyFields.message;
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
        await _userService.register(rawUsername, rawEmail, rawPassword, selectedAvatar, selectedFullAvatar);
        _popupService.showPopup(PopupMessage(message: PopupMessages.SuccessfulAccountCreation.message, hasCloseButton: true, isConfirmation: false));
      } else {
        await _userService.login(rawUsername, rawPassword);
        _popupService.showPopup(PopupMessage(message: PopupMessages.SuccessfulConnection.message, hasCloseButton: true, isConfirmation: false));
      }
      onSuccess();
    } catch (e) {
      String message;
      if (e is AuthException) {
        switch (e.error) {
          case AuthError.usernameExists:
            message = ErrorMessage.UsernameExists.message;
            break;
          case AuthError.invalidCredentials:
            message = ErrorMessage.InvalidCredentials.message;
            break;
          case AuthError.userNotFound:
            message = ErrorMessage.UserNotFound.message;
            break;
          case AuthError.alreadyConnected:
            message = ErrorMessage.AlreadyConnected.message;
            break;
        }
      } else {
        final errorText = e.toString();
        message = isRegister ? "${ErrorMessage.RegistrationFailed.message}$errorText" : '${ErrorMessage.LoginFailed.message}$errorText';
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
        errorMessage = ErrorMessage.UsernameStartsOrEndsWithSpaces.message;
      });
      return false;
    }

    if (rawPassword.isNotEmpty && trimmedPassword.isEmpty) {
      _updateState(() {
        errorMessage = ErrorMessage.PasswordOnlySpaces.message;
      });
      return false;
    }

    if (rawEmail != trimmedEmail || !RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(trimmedEmail)) {
      _updateState(() {
        errorMessage = ErrorMessage.InvalidEmail.message;
      });
      return false;
    }

    if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
      _updateState(() {
        errorMessage = ErrorMessage.ShortUsername.message;
      });
      return false;
    }
    return true;
  }

  void toggleRegister() {
    _updateState(() {
      isRegister = !isRegister;
      errorMessage = null;
    });
  }

  void selectAvatar(String avatarPath) {
    _updateState(() {
      selectedAvatar = avatarPath;
    });
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
    passwordController.dispose();
  }
}
