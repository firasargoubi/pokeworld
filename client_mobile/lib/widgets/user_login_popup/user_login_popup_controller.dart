part of 'user_login_popup.dart';

class UserLoginController {
  final UserService _userService = UserService();
  final PreferencesService _preferencesService = PreferencesService();
  final PopupService _popupService = PopupService();

  final TextEditingController usernameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  LoginPopupView currentView = LoginPopupView.login;
  String selectedLanguage = LANG_LABEL_FR;
  int? selectedAvatarIndex = 0;
  bool isCustomAvatarSelected = false;
  String? customAvatarDataUrl;
  bool isLoading = false;
  String? errorMessage;

  bool get isRegister => currentView == LoginPopupView.register;

  Function(void Function())? _setState;

  void init(Function(void Function()) setState) {
    _setState = setState;
  }

  Future<void> switchLanguage(String lang) async {
    try {
      final AppLanguage appLanguage = lang == LANG_LABEL_FR ? AppLanguage.French : AppLanguage.English;
      await _preferencesService.setLanguage(appLanguage);
      final I18nService i18n = I18nService();
      await i18n.use(appLanguage);
      _updateState(() {
        selectedLanguage = lang;
        errorMessage = null;
      });
    } catch (_) {
      _updateState(() {
        errorMessage = _translateError(ErrorMessage.RegistrationFailed.message);
      });
    }
  }

  void switchView(LoginPopupView view) {
    _updateState(() {
      currentView = view;
      errorMessage = null;
      confirmPasswordController.clear();
    });
  }

  void selectAvatar(int index) {
    _updateState(() {
      selectedAvatarIndex = index;
      isCustomAvatarSelected = false;
      customAvatarDataUrl = null;
    });
  }

  Future<void> onCustomAvatarTapped() async {
    try {
      final XFile? capturedImage = await CameraService().openCamera(maxWidth: 1024, maxHeight: 1024, imageQuality: 85);
      if (capturedImage != null) {
        final List<int> imageBytes = await capturedImage.readAsBytes();
        if (imageBytes.length > 1024 * 1024) {
          _updateState(() {
            errorMessage = _translateError(ErrorMessage.ImageTooLarge.message);
          });
          return;
        }

        final String base64Image = base64Encode(imageBytes);
        final String mimeType = capturedImage.mimeType ?? 'image/jpeg';
        final String encodedDataUrl = 'data:$mimeType;base64,$base64Image';

        _updateState(() {
          customAvatarDataUrl = encodedDataUrl;
          isCustomAvatarSelected = true;
          selectedAvatarIndex = null;
          errorMessage = null;
        });
      }
    } catch (error) {
      debugPrint('Error capturing image: $error');
    }
  }

  String? _validateLogin() {
    final String rawUsername = usernameController.text.toUpperCase();
    final String rawPassword = passwordController.text;

    if (rawUsername.isEmpty || rawPassword.isEmpty) {
      return ErrorMessage.EmptyFields.message;
    }
    return null;
  }

  String? _validateRegister() {
    final String rawUsername = usernameController.text.toUpperCase();
    final String trimmedUsername = rawUsername.trim();
    final String rawEmail = emailController.text;
    final String trimmedEmail = rawEmail.trim();
    final String rawPassword = passwordController.text;
    final String trimmedPassword = rawPassword.trim();

    if (rawUsername.isEmpty || rawEmail.isEmpty || rawPassword.isEmpty || confirmPasswordController.text.isEmpty) {
      return ErrorMessage.EmptyFields.message;
    }
    if (rawUsername != trimmedUsername) {
      return ErrorMessage.UsernameStartsOrEndsWithSpaces.message;
    }
    if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
      return ErrorMessage.ShortUsername.message;
    }
    if (rawPassword.isNotEmpty && trimmedPassword.isEmpty) {
      return ErrorMessage.PasswordOnlySpaces.message;
    }
    if (rawPassword != confirmPasswordController.text) {
      return LOGIN_POPUP_PASSWORD_MISMATCH;
    }
    if (rawEmail != trimmedEmail || !RegExp(r'^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9\-.]+)\.([a-zA-Z]{2,})$').hasMatch(trimmedEmail)) {
      return ErrorMessage.InvalidEmail.message;
    }
    if (!isCustomAvatarSelected && selectedAvatarIndex == null) {
      return LOGIN_POPUP_AVATAR_REQUIRED_ERROR;
    }
    if (isCustomAvatarSelected && (customAvatarDataUrl == null || customAvatarDataUrl!.isEmpty)) {
      return LOGIN_POPUP_AVATAR_REQUIRED_ERROR;
    }
    return null;
  }

  Future<void> handleAction({required VoidCallback onSuccess}) async {
    final String? error = isRegister ? _validateRegister() : _validateLogin();
    if (error != null) {
      _updateState(() => errorMessage = _translateError(error));
      return;
    }

    _updateState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      if (isRegister) {
        final bool useCustomAvatar = isCustomAvatarSelected && customAvatarDataUrl != null && customAvatarDataUrl!.isNotEmpty;
        _popupService.showPopup(
          PopupMessage(
            message: I18nService().translate(PopupMessages.ConfirmAccountCreation.messageKey),
            isConfirmation: true,
            popupColor: PopupColor.Orange,
            action: () async {
              try {
                await _userService.register(
                  usernameController.text.trim(),
                  emailController.text.trim(),
                  passwordController.text,
                  useCustomAvatar ? customAvatarDataUrl! : USER_PROFILE_PICTURES[selectedAvatarIndex!],
                  useCustomAvatar ? customAvatarDataUrl! : USER_FULL_PROFILE_PICTURES[selectedAvatarIndex!],
                  preferences: UserPreferences(language: _preferencesService.currentLanguage.value, theme: _preferencesService.currentTheme.value),
                );
                _popupService.showPopup(
                  PopupMessage(
                    message: I18nService().translate(PopupMessages.SuccessfulAccountCreation.messageKey),
                    hasCloseButton: true,
                    isConfirmation: false,
                    popupColor: PopupColor.Green,
                  ),
                );
                onSuccess();
              } catch (e) {
                _updateState(() {
                  errorMessage = _resolveErrorMessage(e);
                  isLoading = false;
                });
              }
            },
          ),
        );
        _updateState(() => isLoading = false);
        return;
      } else {
        await _userService.login(usernameController.text.trim(), passwordController.text);
        _preferencesService.syncPreferencesFromUser();
        final I18nService i18n = I18nService();
        await i18n.use(_preferencesService.currentLanguage.value);
        _popupService.showPopup(
          PopupMessage(
            message: i18n.translate(PopupMessages.SuccessfulConnection.messageKey),
            hasCloseButton: true,
            isConfirmation: false,
            popupColor: PopupColor.Green,
          ),
        );
      }
      onSuccess();
    } catch (e) {
      _updateState(() {
        errorMessage = _resolveErrorMessage(e);
        isLoading = false;
      });
    }
  }

  String _translateError(String messageOrKey) {
    final String translated = I18nService().translate(messageOrKey);
    return translated == messageOrKey ? messageOrKey : translated;
  }

  String _resolveErrorMessage(Object e) {
    if (e is AuthException) {
      switch (e.error) {
        case AuthError.usernameExists:
          return _translateError(ErrorMessage.UsernameExists.message);
        case AuthError.invalidCredentials:
          return _translateError(ErrorMessage.InvalidCredentials.message);
        case AuthError.userNotFound:
          return _translateError(ErrorMessage.UserNotFound.message);
        case AuthError.alreadyConnected:
          return _translateError(ErrorMessage.AlreadyConnected.message);
      }
    }
    final String errorText = e.toString();
    final String errorPrefix = _translateError(isRegister ? ErrorMessage.RegistrationFailed.message : ErrorMessage.LoginFailed.message);
    return '$errorPrefix $errorText';
  }

  void _updateState(void Function() callback) {
    _setState?.call(() => callback());
  }

  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
  }
}
