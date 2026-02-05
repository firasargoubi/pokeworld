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
  final TextEditingController passwordController = TextEditingController();

  Function(void Function())? _setState;

  void init(Function(void Function()) setState) {
    _setState = setState;
  }

  Future<void> handleSubmit({required Function() onSuccess}) async {
    final username = usernameController.text.trim().toUpperCase();
    final password = passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      _updateState(() {
        errorMessage = ErrorMessages.emptyFields;
      });
      return;
    }

    if (username.length < minUsernameLength) {
      _updateState(() {
        errorMessage = ErrorMessages.shortUsername;
      });
      return;
    }

    _updateState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      if (isRegister) {
        await _userService.register(username, password);
      } else {
        await _userService.login(username, password);
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
