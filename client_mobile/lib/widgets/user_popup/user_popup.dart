import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/chat_service/chat_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/binary_toggle/binary_toggle.dart';
import 'package:client_mobile/widgets/login_popup/login_popup.dart';
import 'package:flutter/material.dart';

import 'user_popup_consts.dart';

class UserPopup extends StatefulWidget {
  const UserPopup({super.key});

  @override
  State<UserPopup> createState() => _UserPopupState();
}

class _UserPopupState extends State<UserPopup> {
  final PreferencesService _preferencesService = PreferencesService();
  final I18nService _i18nService = I18nService();
  bool _editMode = false;
  String _oldPassword = '';
  String _newPassword = '';
  String _passwordError = '';

  String _translateError(Object error) {
    if (error is AuthException) {
      switch (error.error) {
        case AuthError.usernameExists:
          return _i18nService.translate(ErrorMessage.UsernameExists.message);
        case AuthError.invalidCredentials:
          return _i18nService.translate(ErrorMessage.InvalidCredentials.message);
        case AuthError.userNotFound:
          return _i18nService.translate(ErrorMessage.UserNotFound.message);
        case AuthError.alreadyConnected:
          return _i18nService.translate(ErrorMessage.AlreadyConnected.message);
      }
    }

    final rawMessage = switch (error) {
      StateError(:final message) => message,
      _ => error.toString(),
    };
    final normalizedMessage = rawMessage.replaceFirst('Exception: ', '').replaceFirst('Bad state: ', '').trim();
    final translatedMessage = _i18nService.translate(normalizedMessage);
    return translatedMessage == normalizedMessage ? normalizedMessage : translatedMessage;
  }

  void _showErrorPopup(Object error) {
    PopupService().showPopup(PopupMessage(message: _translateError(error), hasCloseButton: true, isConfirmation: false));
  }

  Future<void> _handleLanguageChange(AppLanguage language) async {
    try {
      await _preferencesService.setLanguage(language);
    } catch (e) {
      _showErrorPopup(e);
    }
  }

  Future<void> _handleThemeChange(AppTheme theme) async {
    try {
      await _preferencesService.setTheme(theme);
    } catch (e) {
      _showErrorPopup(e);
    }
  }

  void _showLoginDialog() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    Navigator.of(context).pop();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return PopScope(canPop: false, onPopInvokedWithResult: (didPop, result) {}, child: const LoginPopup());
      },
    );
  }

  Future<void> _handleLogout() async {
    AudioService().playSoundEffect(SoundEffect.Select.path);

    try {
      await UserService().logout();
      final preferencesService = PreferencesService();
      await preferencesService.setThemeBeforeAuth(AppTheme.DefaultTheme);
      ChatService().clearChatHistory();
      if (!mounted) {
        return;
      }
      _showLoginDialog();
    } catch (e) {
      _showErrorPopup(e);
    }
  }

  Future<void> _handleDeleteAccount() async {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    final userId = UserService().currentUser.value?.userId;
    if (userId == null) {
      return;
    }
    try {
      await UserService().delete(userId);
      ChatService().clearChatHistory();
      if (!mounted) {
        return;
      }
      _showLoginDialog();
    } catch (e) {
      _showErrorPopup(e);
    }
  }

  Future<void> _handleEditPassword() async {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    final currentUser = UserService().currentUser.value;
    if (currentUser == null || _oldPassword.trim().isEmpty || _newPassword.trim().isEmpty) {
      setState(() {
        _passwordError = _i18nService.translate(USER_POPUP_REQUIRED_FIELDS_ERROR);
      });
      return;
    }

    try {
      await UserService().edit(currentUser.userId, _oldPassword.trim(), _newPassword.trim());
      setState(() {
        _editMode = false;
        _oldPassword = '';
        _newPassword = '';
        _passwordError = '';
      });
      PopupService().showPopup(
        PopupMessage(message: I18nService().translate(PopupMessages.ChangeConfirmed.messageKey), hasCloseButton: true, isConfirmation: false),
      );
    } catch (e) {
      setState(() {
        _passwordError = '';
      });
      _showErrorPopup(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: AnimatedBuilder(
        animation: Listenable.merge([_preferencesService.currentLanguage, _preferencesService.currentTheme]),
        builder: (context, _) {
          final language = _preferencesService.currentLanguage.value;
          final theme = _preferencesService.currentTheme.value;
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(_i18nService.translate(USER_POPUP_TITLE), overflow: TextOverflow.ellipsis)),
              const SizedBox(width: 12),
              BinaryToggle(
                leftSelected: language == AppLanguage.French,
                leftLabel: _i18nService.translate(USER_POPUP_LANGUAGE_FRENCH),
                rightLabel: _i18nService.translate(USER_POPUP_LANGUAGE_ENGLISH),
                onChanged: (isFrench) {
                  _handleLanguageChange(isFrench ? AppLanguage.French : AppLanguage.English);
                },
              ),
              const SizedBox(width: 8),
              BinaryToggle(
                leftSelected: theme == AppTheme.DefaultTheme,
                leftLabel: _i18nService.translate(USER_POPUP_THEME_DEFAULT),
                rightLabel: _i18nService.translate(USER_POPUP_THEME_DARK),
                onChanged: (isDefault) {
                  _handleThemeChange(isDefault ? AppTheme.DefaultTheme : AppTheme.Dark);
                },
              ),
            ],
          );
        },
      ),
      content: ValueListenableBuilder<UserInfo?>(
        valueListenable: UserService().currentUser,
        builder: (context, user, _) {
          final username = user?.username ?? _i18nService.translate(USER_POPUP_UNKNOWN_USER);
          final email = user?.email ?? _i18nService.translate(USER_POPUP_UNKNOWN_EMAIL);
          final avatar = profilePictureImageProvider(
            user?.fullProfilePicture,
            fallback: const AssetImage('assets/images/menu/fullAvatars/fullAvatar0.png'),
          );
          return SizedBox(
            width: 240,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 4),
                Image(image: avatar, height: 120, fit: BoxFit.contain),
                const SizedBox(height: 8),
                Text(username, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 6),
                Text(email, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14)),
                if (_editMode) ...[
                  const SizedBox(height: 12),
                  TextField(
                    obscureText: true,
                    onChanged: (value) => _oldPassword = value,
                    decoration: InputDecoration(labelText: _i18nService.translate(USER_POPUP_OLD_PASSWORD_LABEL), isDense: true),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    obscureText: true,
                    onChanged: (value) => _newPassword = value,
                    decoration: InputDecoration(labelText: _i18nService.translate(USER_POPUP_NEW_PASSWORD_LABEL), isDense: true),
                  ),
                  if (_passwordError.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(_passwordError, style: const TextStyle(color: Colors.red, fontSize: 12)),
                    ),
                ],
              ],
            ),
          );
        },
      ),
      actions: [
        TextButton(
          onPressed: () {
            AudioService().playSoundEffect(SoundEffect.Select.path);
            setState(() {
              _editMode = !_editMode;
              _oldPassword = '';
              _newPassword = '';
              _passwordError = '';
            });
          },
          child: Text(_i18nService.translate(_editMode ? USER_POPUP_CANCEL : USER_POPUP_EDIT_PASSWORD)),
        ),
        if (_editMode) TextButton(onPressed: () => _handleEditPassword(), child: Text(_i18nService.translate(USER_POPUP_CONFIRM))),
        TextButton(
          onPressed: () {
            AudioService().playSoundEffect(SoundEffect.Select.path);
            PopupService().showPopup(
              PopupMessage(
                message: I18nService().translate(PopupMessages.LogoutConfirmation.messageKey),
                hasCloseButton: true,
                isConfirmation: true,
                action: () {
                  _handleLogout();
                },
              ),
            );
          },
          child: Text(_i18nService.translate(USER_POPUP_LOGOUT)),
        ),
        TextButton(
          onPressed: () {
            AudioService().playSoundEffect(SoundEffect.Select.path);
            PopupService().showPopup(
              PopupMessage(
                message: _i18nService.translate(USER_POPUP_DELETE_ACCOUNT_CONFIRMATION),
                hasCloseButton: true,
                isConfirmation: true,
                action: () {
                  _handleDeleteAccount();
                },
              ),
            );
          },
          child: Text(_i18nService.translate(USER_POPUP_DELETE_ACCOUNT)),
        ),
        TextButton(
          onPressed: () {
            AudioService().playSoundEffect(SoundEffect.Select.path);
            Navigator.of(context).pop();
          },
          child: Text(_i18nService.translate(USER_POPUP_CLOSE)),
        ),
      ],
    );
  }
}
