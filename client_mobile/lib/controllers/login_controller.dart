import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/consts/error_messages.dart';
import 'package:client_mobile/services/user_service.dart';
import 'package:flutter/material.dart';

import '../consts/chat_const.dart';

class LoginController {
  final UserService _userService = UserService();

  bool isRegister = false;
  bool isLoading = false;
  String? errorMessage;

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

    if (rawUsername.isEmpty || rawPassword.isEmpty || rawEmail.isEmpty) {
      _updateState(() {
        errorMessage = ErrorMessages.emptyFields;
      });
      return;
    }

    if (isRegister) {
      final isValid = registerChecks(
        rawUsername,
        trimmedUsername,
        rawEmail,
        trimmedEmail,
        rawPassword,
        trimmedPassword,
      );
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
        await _userService.register(rawUsername, rawEmail, rawPassword);
      } else {
        await _userService.login(rawUsername, rawPassword);
      }
      onSuccess();
    } catch (e) {
      String message;
      if (e is AuthException) {
        switch (e.error) {
          case AuthError.usernameExists:
            message = ErrorMessages.usernameExists;
            break;
          case AuthError.invalidCredentials:
            message = ErrorMessages.invalidCredentials;
            break;
          case AuthError.userNotFound:
            message = ErrorMessages.userNotFound;
            break;
          case AuthError.alreadyConnected:
            message = ErrorMessages.alreadyConnected;
            break;
        }
      } else {
        final errorText = e.toString();
        message = isRegister
            ? "${ErrorMessages.registrationFailed}$errorText"
            : '${ErrorMessages.loginFailed}$errorText';
      }

      _updateState(() {
        errorMessage = message;
        isLoading = false;
      });
    }
  }

  bool registerChecks(
    String rawUsername,
    String trimmedUsername,
    String rawEmail,
    String trimmedEmail,
    String rawPassword,
    String trimmedPassword,
  ) {
    if (rawUsername != trimmedUsername) {
      _updateState(() {
        errorMessage = ErrorMessages.usernameStartsOrEndsWithSpaces;
      });
      return false;
    }

    if (rawPassword.isNotEmpty && trimmedPassword.isEmpty) {
      _updateState(() {
        errorMessage = ErrorMessages.passwordOnlySpaces;
      });
      return false;
    }

    if (rawEmail != trimmedEmail ||
        !RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(trimmedEmail)) {
      _updateState(() {
        errorMessage = ErrorMessages.invalidEmail;
      });
      return false;
    }

    if (trimmedUsername.length < minUsernameLength) {
      _updateState(() {
        errorMessage = ErrorMessages.shortUsername;
      });
      return false;
    }
    return true;
  }

  void toggleRegister() {
    _updateState(() {
      isRegister = !isRegister;
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
    passwordController.dispose();
  }
}
