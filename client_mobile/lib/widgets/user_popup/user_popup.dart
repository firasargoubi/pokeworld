import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/consts/login_const.dart';
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
import 'package:flutter/services.dart';

import 'user_popup_consts.dart';

class UserPopup extends StatefulWidget {
  const UserPopup({super.key});

  @override
  State<UserPopup> createState() => _UserPopupState();
}

class _UserPopupState extends State<UserPopup> {
  final PreferencesService _preferencesService = PreferencesService();
  final I18nService _i18nService = I18nService();
  final TextEditingController _newUsernameController = TextEditingController();
  final TextEditingController _oldPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmNewPasswordController = TextEditingController();
  bool _editMode = false;
  String _oldPassword = '';
  String _newPassword = '';
  String _confirmNewPassword = '';
  String _newUsername = '';
  String _usernameError = '';
  String _passwordError = '';
  bool _isUpdatingUsername = false;
  bool _isUpdatingPassword = false;

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
    final oldPassword = _oldPassword.trim();
    final newPassword = _newPassword.trim();
    final confirmNewPassword = _confirmNewPassword.trim();

    if (currentUser == null || oldPassword.isEmpty || newPassword.isEmpty || confirmNewPassword.isEmpty) {
      setState(() {
        _passwordError = _i18nService.translate(USER_POPUP_REQUIRED_FIELDS_ERROR);
      });
      return;
    }

    if (newPassword != confirmNewPassword) {
      setState(() {
        _passwordError = _i18nService.translate(USER_POPUP_PASSWORD_MISMATCH);
      });
      return;
    }

    if (oldPassword == newPassword) {
      setState(() {
        _passwordError = _i18nService.translate(USER_POPUP_PASSWORD_UNCHANGED);
      });
      return;
    }

    try {
      setState(() {
        _isUpdatingPassword = true;
      });
      await UserService().edit(userId: currentUser.userId, oldPassword: oldPassword, password: newPassword);
      _oldPasswordController.clear();
      _newPasswordController.clear();
      _confirmNewPasswordController.clear();
      setState(() {
        _oldPassword = '';
        _newPassword = '';
        _confirmNewPassword = '';
        _passwordError = '';
        _isUpdatingPassword = false;
      });
      PopupService().showPopup(
        PopupMessage(message: I18nService().translate(PopupMessages.ChangeConfirmed.messageKey), hasCloseButton: true, isConfirmation: false),
      );
    } catch (e) {
      setState(() {
        _passwordError = _translateError(e);
        _isUpdatingPassword = false;
      });
    }
  }

  Future<void> _confirmUsernameUpdate(String sanitizedUsername) async {
    final currentUser = UserService().currentUser.value;
    if (currentUser == null) return;

    try {
      setState(() {
        _isUpdatingUsername = true;
      });
      final updatedUser = await UserService().edit(userId: currentUser.userId, username: sanitizedUsername);
      if (!mounted) return;
      setState(() {
        _newUsername = updatedUser.username;
        _newUsernameController.text = updatedUser.username;
        _usernameError = '';
        _isUpdatingUsername = false;
      });
      PopupService().showPopup(
        PopupMessage(message: I18nService().translate(PopupMessages.ChangeConfirmed.messageKey), hasCloseButton: true, isConfirmation: false),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _usernameError = _translateError(e);
        _isUpdatingUsername = false;
      });
      _showErrorPopup(e);
    }
  }

  void _handleEditUsername() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    final currentUser = UserService().currentUser.value;
    if (currentUser == null) return;

    final sanitizedNewUsername = _newUsername.trim().toUpperCase();
    if (sanitizedNewUsername.isEmpty) {
      setState(() {
        _usernameError = _i18nService.translate(USER_POPUP_USERNAME_REQUIRED);
      });
      return;
    }

    if (sanitizedNewUsername.length < MIN_USERNAME_LENGTH || sanitizedNewUsername.length > MAX_USERNAME_LENGTH) {
      setState(() {
        _usernameError = _i18nService.translate(USER_POPUP_USERNAME_LENGTH);
      });
      return;
    }

    if (sanitizedNewUsername == currentUser.username) {
      setState(() {
        _usernameError = _i18nService.translate(USER_POPUP_USERNAME_UNCHANGED);
      });
      return;
    }

    PopupService().showPopup(
      PopupMessage(
        message: _i18nService.translate(USER_POPUP_CONFIRM_USERNAME_CHANGE),
        hasCloseButton: true,
        isConfirmation: true,
        action: () {
          _confirmUsernameUpdate(sanitizedNewUsername);
        },
      ),
    );
  }

  @override
  void dispose() {
    _newUsernameController.dispose();
    _oldPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmNewPasswordController.dispose();
    super.dispose();
  }

  void _toggleEditMode() {
    final currentUsername = UserService().currentUser.value?.username ?? '';
    _oldPasswordController.clear();
    _newPasswordController.clear();
    _confirmNewPasswordController.clear();
    setState(() {
      _editMode = !_editMode;
      _oldPassword = '';
      _newPassword = '';
      _confirmNewPassword = '';
      _passwordError = '';
      _usernameError = '';
      _newUsername = currentUsername;
      _newUsernameController.text = currentUsername;
      _isUpdatingUsername = false;
      _isUpdatingPassword = false;
    });
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
                    controller: _newUsernameController,
                    inputFormatters: [LengthLimitingTextInputFormatter(MAX_USERNAME_LENGTH)],
                    onChanged: (value) {
                      final upper = value.toUpperCase();
                      if (upper != value) {
                        _newUsernameController.value = TextEditingValue(
                          text: upper,
                          selection: TextSelection.collapsed(offset: upper.length),
                        );
                      }
                      setState(() {
                        _newUsername = upper;
                        _usernameError = '';
                      });
                    },
                    decoration: InputDecoration(
                      labelText: _i18nService.translate(USER_POPUP_NEW_USERNAME_LABEL),
                      hintText: _i18nService.translate(USER_POPUP_NEW_USERNAME_PLACEHOLDER),
                      isDense: true,
                    ),
                    textCapitalization: TextCapitalization.characters,
                  ),
                  if (_usernameError.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(_usernameError, style: const TextStyle(color: Colors.red, fontSize: 12)),
                    ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _oldPasswordController,
                    obscureText: true,
                    onChanged: (value) => _oldPassword = value,
                    decoration: InputDecoration(labelText: _i18nService.translate(USER_POPUP_OLD_PASSWORD_LABEL), isDense: true),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _newPasswordController,
                    obscureText: true,
                    onChanged: (value) => _newPassword = value,
                    decoration: InputDecoration(labelText: _i18nService.translate(USER_POPUP_NEW_PASSWORD_LABEL), isDense: true),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _confirmNewPasswordController,
                    obscureText: true,
                    onChanged: (value) => _confirmNewPassword = value,
                    decoration: InputDecoration(labelText: _i18nService.translate(USER_POPUP_CONFIRM_PASSWORD_PLACEHOLDER), isDense: true),
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
            _toggleEditMode();
          },
          child: Text(_i18nService.translate(_editMode ? USER_POPUP_CANCEL : USER_POPUP_EDIT_PASSWORD)),
        ),
        if (_editMode) ...[
          TextButton(onPressed: _isUpdatingUsername ? null : _handleEditUsername, child: Text(_i18nService.translate(USER_POPUP_UPDATE_USERNAME))),
          TextButton(
            onPressed: _isUpdatingPassword ? null : () => _handleEditPassword(),
            child: Text(_i18nService.translate(USER_POPUP_UPDATE_PASSWORD)),
          ),
        ],
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
