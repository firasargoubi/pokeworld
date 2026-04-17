import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/consts/login_const.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/chat_service/chat_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/user_profile_popup/user_profile_popup.dart';
import 'package:flutter/material.dart';

class SettingsController extends ChangeNotifier {
  final TextEditingController newUsernameController = TextEditingController();
  final TextEditingController oldPasswordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmNewPasswordController = TextEditingController();

  String _oldPassword = '';
  String _newPassword = '';
  String _confirmNewPassword = '';
  String _newUsername = '';
  String _usernameError = '';
  String _passwordError = '';
  bool _isUpdatingUsername = false;
  bool _isUpdatingPassword = false;

  String get usernameError => _usernameError;
  String get passwordError => _passwordError;
  bool get isUpdatingUsername => _isUpdatingUsername;
  bool get isUpdatingPassword => _isUpdatingPassword;

  SettingsController() {
    final currentUsername = UserService().currentUser.value?.username ?? '';
    _newUsername = currentUsername;
    newUsernameController.text = currentUsername;
  }

  @override
  void dispose() {
    newUsernameController.dispose();
    oldPasswordController.dispose();
    newPasswordController.dispose();
    confirmNewPasswordController.dispose();
    super.dispose();
  }

  String _translateError(Object error) {
    if (error is AuthException) {
      switch (error.error) {
        case AuthError.usernameExists:
          return I18nService().translate(ErrorMessage.UsernameExists.message);
        case AuthError.invalidCredentials:
          return I18nService().translate(ErrorMessage.InvalidCredentials.message);
        case AuthError.wrongPassword:
          return I18nService().translate(ErrorMessage.WrongPassword.message);
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

  Future<void> _handleDeleteAccount() async {
    final userId = UserService().currentUser.value?.userId;
    if (userId == null) return;
    try {
      await UserService().delete(userId);
      ChatService().clearChatHistory();
    } catch (e) {
      _showErrorPopup(e);
    }
  }

  void showDeleteAccountConfirmation() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    PopupService().showPopup(
      PopupMessage(
        message: I18nService().translate(USER_POPUP_DELETE_ACCOUNT_CONFIRMATION),
        hasCloseButton: true,
        isConfirmation: true,
        action: () => _handleDeleteAccount(),
      ),
    );
  }

  Future<void> _confirmUsernameUpdate(String sanitizedUsername) async {
    final currentUser = UserService().currentUser.value;
    if (currentUser == null) return;

    try {
      _isUpdatingUsername = true;
      notifyListeners();
      final updatedUser = await UserService().edit(userId: currentUser.userId, username: sanitizedUsername);
      _newUsername = updatedUser.username;
      newUsernameController.text = updatedUser.username;
      _usernameError = '';
      _isUpdatingUsername = false;
      notifyListeners();
      PopupService().showPopup(
        PopupMessage(
          message: I18nService().translate(PopupMessages.ChangeConfirmed.messageKey),
          hasCloseButton: true,
          isConfirmation: false,
          popupColor: PopupColor.Green,
        ),
      );
    } catch (e) {
      _usernameError = _translateError(e);
      _isUpdatingUsername = false;
      notifyListeners();
      _showErrorPopup(e);
    }
  }

  void handleEditUsername() {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    final currentUser = UserService().currentUser.value;
    if (currentUser == null) return;

    final sanitizedNewUsername = _newUsername.trim().toUpperCase();
    if (sanitizedNewUsername.isEmpty) {
      _usernameError = I18nService().translate(USER_POPUP_USERNAME_REQUIRED);
      notifyListeners();
      return;
    }

    if (sanitizedNewUsername.length < MIN_USERNAME_LENGTH || sanitizedNewUsername.length > MAX_USERNAME_LENGTH) {
      _usernameError = I18nService().translate(USER_POPUP_USERNAME_LENGTH);
      notifyListeners();
      return;
    }

    if (sanitizedNewUsername == currentUser.username) {
      _usernameError = I18nService().translate(USER_POPUP_USERNAME_UNCHANGED);
      notifyListeners();
      return;
    }

    PopupService().showPopup(
      PopupMessage(
        message: I18nService().translate(USER_POPUP_CONFIRM_USERNAME_CHANGE),
        hasCloseButton: true,
        isConfirmation: true,
        action: () => _confirmUsernameUpdate(sanitizedNewUsername),
      ),
    );
  }

  Future<void> handleEditPassword() async {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    final currentUser = UserService().currentUser.value;
    final oldPassword = _oldPassword.trim();
    final newPassword = _newPassword.trim();
    final confirmNewPassword = _confirmNewPassword.trim();

    if (currentUser == null || oldPassword.isEmpty || newPassword.isEmpty || confirmNewPassword.isEmpty) {
      _passwordError = I18nService().translate(USER_POPUP_REQUIRED_FIELDS_ERROR);
      notifyListeners();
      return;
    }

    if (newPassword != confirmNewPassword) {
      _passwordError = I18nService().translate(USER_POPUP_PASSWORD_MISMATCH);
      notifyListeners();
      return;
    }

    if (oldPassword == newPassword) {
      _passwordError = I18nService().translate(USER_POPUP_PASSWORD_UNCHANGED);
      notifyListeners();
      return;
    }

    try {
      _isUpdatingPassword = true;
      notifyListeners();
      await UserService().edit(userId: currentUser.userId, oldPassword: oldPassword, password: newPassword);
      oldPasswordController.clear();
      newPasswordController.clear();
      confirmNewPasswordController.clear();
      _oldPassword = '';
      _newPassword = '';
      _confirmNewPassword = '';
      _passwordError = '';
      _isUpdatingPassword = false;
      notifyListeners();
      PopupService().showPopup(
        PopupMessage(
          message: I18nService().translate(PopupMessages.ChangeConfirmed.messageKey),
          hasCloseButton: true,
          isConfirmation: false,
          popupColor: PopupColor.Green,
        ),
      );
    } catch (e) {
      _passwordError = _translateError(e);
      _isUpdatingPassword = false;
      notifyListeners();
    }
  }

  void onUsernameChanged(String value) {
    final upper = value.toUpperCase();
    if (upper != value) {
      newUsernameController.value = TextEditingValue(
        text: upper,
        selection: TextSelection.collapsed(offset: upper.length),
      );
    }
    _newUsername = upper;
    _usernameError = '';
    notifyListeners();
  }

  void onOldPasswordChanged(String value) => _oldPassword = value;
  void onNewPasswordChanged(String value) => _newPassword = value;
  void onConfirmPasswordChanged(String value) => _confirmNewPassword = value;

  void reset() {
    final currentUsername = UserService().currentUser.value?.username ?? '';
    oldPasswordController.clear();
    newPasswordController.clear();
    confirmNewPasswordController.clear();
    _oldPassword = '';
    _newPassword = '';
    _confirmNewPassword = '';
    _passwordError = '';
    _usernameError = '';
    _newUsername = currentUsername;
    newUsernameController.text = currentUsername;
    _isUpdatingUsername = false;
    _isUpdatingPassword = false;
    notifyListeners();
  }
}
