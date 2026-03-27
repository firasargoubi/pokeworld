part of 'user_login_popup.dart';

class _LoginCardFace extends StatelessWidget {
  const _LoginCardFace({
    required this.baseSize,
    required this.currentView,
    required this.onSwitchView,
    required this.usernameController,
    required this.emailController,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.selectedLanguage,
    required this.onLanguageSwitch,
    required this.selectedAvatarIndex,
    required this.isCustomAvatarSelected,
    required this.customAvatarDataUrl,
    required this.onAvatarSelected,
    required this.onCustomAvatarTapped,
    required this.isLoading,
    required this.errorMessage,
    required this.onAction,
  });

  final double baseSize;
  final LoginPopupView currentView;
  final void Function(LoginPopupView) onSwitchView;
  final TextEditingController usernameController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final String selectedLanguage;
  final void Function(String) onLanguageSwitch;
  final int? selectedAvatarIndex;
  final bool isCustomAvatarSelected;
  final String? customAvatarDataUrl;
  final void Function(int) onAvatarSelected;
  final Future<void> Function() onCustomAvatarTapped;
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    final I18nService i18n = I18nService();

    return FramedContainer(
      style: USER_CARD_STYLE,
      baseSize: baseSize * 0.09,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -baseSize * 0.022,
            left: -baseSize * 0.019,
            child: Image.asset(ASSET_CARD_ICON_BG, height: baseSize * 0.6, fit: BoxFit.contain, filterQuality: FilterQuality.none),
          ),
          Column(
            children: [
              SizedBox(
                height: baseSize * 0.12,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: _CardTitleRow(
                        title: currentView == LoginPopupView.register ? i18n.translate(REGISTER_TITLE) : i18n.translate(LOGIN_TITLE),
                        baseSize: baseSize,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Opacity(
                          opacity: selectedLanguage == LANG_LABEL_FR ? 1.0 : 0.45,
                          child: _LangActionButton(
                            icon: Icons.inventory_2,
                            onPressed: isLoading
                                ? () {}
                                : () {
                                    AudioService().playSoundEffect(SoundEffect.Select.path);
                                    onLanguageSwitch(LANG_LABEL_FR);
                                  },
                            baseSize: baseSize,
                            label: i18n.translate(LANG_KEY_FR),
                          ),
                        ),
                        SizedBox(width: baseSize * 0.02),
                        Opacity(
                          opacity: selectedLanguage == LANG_LABEL_EN ? 1.0 : 0.45,
                          child: _LangActionButton(
                            icon: Icons.settings,
                            onPressed: isLoading
                                ? () {}
                                : () {
                                    AudioService().playSoundEffect(SoundEffect.Select.path);
                                    onLanguageSwitch(LANG_LABEL_EN);
                                  },
                            baseSize: baseSize,
                            label: i18n.translate(LANG_KEY_EN),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 3,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: baseSize * 0.01, vertical: baseSize * 0.01),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: double.infinity,
                          child: CutCornerBorderContainer(
                            backgroundColor: const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                            borderColor: LOGIN_BORDER_COLOR,
                            borderWidth: baseSize * 0.007,
                            padding: EdgeInsets.symmetric(horizontal: baseSize * 0.02, vertical: baseSize * 0.02),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              spacing: baseSize * 0.02,
                              children: [
                                _CardSettingsRow(
                                  label: i18n.translate(LOGIN_FIELD_USERNAME_KEY),
                                  baseSize: baseSize,
                                  controller: usernameController,
                                  enabled: !isLoading,
                                  keyboardType: TextInputType.text,
                                  inputFormatters: [UsernameInputFormatter(), LengthLimitingTextInputFormatter(MAX_USERNAME_LENGTH)],
                                ),
                                if (currentView == LoginPopupView.register)
                                  _CardSettingsRow(
                                    label: i18n.translate(LOGIN_FIELD_EMAIL_KEY),
                                    baseSize: baseSize,
                                    controller: emailController,
                                    enabled: !isLoading,
                                    keyboardType: TextInputType.emailAddress,
                                  ),
                                _CardSettingsRow(
                                  label: i18n.translate(LOGIN_FIELD_PASSWORD_KEY),
                                  baseSize: baseSize,
                                  controller: passwordController,
                                  enabled: !isLoading,
                                  obscureText: true,
                                ),
                                if (currentView == LoginPopupView.register)
                                  _CardSettingsRow(
                                    label: i18n.translate(LOGIN_FIELD_CONFIRM_PASSWORD_KEY),
                                    baseSize: baseSize,
                                    controller: confirmPasswordController,
                                    enabled: !isLoading,
                                    obscureText: true,
                                  ),
                                Expanded(child: Text(errorMessage ?? '', style: ERROR_TEXT_STYLE(baseSize * 0.035))),
                              ],
                            ),
                          ),
                        ),
                      ),
                      if (currentView == LoginPopupView.register) ...[
                        SizedBox(width: baseSize * 0.02),
                        SizedBox(
                          width: baseSize * 0.33,
                          child: CutCornerBorderContainer(
                            backgroundColor: const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                            borderColor: LOGIN_BORDER_COLOR,
                            borderWidth: baseSize * 0.007,
                            padding: EdgeInsets.only(left: baseSize * 0.02, right: baseSize * 0.02, top: baseSize * 0.02),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Text(i18n.translate(LOGIN_AVATAR_SECTION_TITLE_KEY), style: BUTTON_TEXT_STYLE(baseSize * 0.025)),
                                Expanded(
                                  child: Container(
                                    margin: EdgeInsets.only(top: baseSize * 0.02),
                                    child: GridView.count(
                                      crossAxisCount: 3,
                                      mainAxisSpacing: baseSize * 0.01,
                                      crossAxisSpacing: baseSize * 0.01,
                                      children: List.generate(USER_PROFILE_PICTURES.length + 1, (index) {
                                        if (index == 0) {
                                          return GestureDetector(
                                            onTap: isLoading
                                                ? null
                                                : () {
                                                    AudioService().playSoundEffect(SoundEffect.Select.path);
                                                    onCustomAvatarTapped();
                                                  },
                                            child: CutCornerBorderContainer(
                                              backgroundColor: const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                                              borderColor: isCustomAvatarSelected
                                                  ? const Color.fromARGB(255, 255, 255, 255)
                                                  : const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                                              borderWidth: baseSize * 0.007,
                                              child: Center(
                                                child: customAvatarDataUrl != null && customAvatarDataUrl!.isNotEmpty
                                                    ? Image(
                                                        image: profilePictureImageProvider(customAvatarDataUrl),
                                                        fit: BoxFit.cover,
                                                        filterQuality: FilterQuality.none,
                                                      )
                                                    : Text(
                                                        '+',
                                                        style: TextStyle(
                                                          fontFamily: 'Pixel',
                                                          color: Colors.white,
                                                          fontSize: baseSize * 0.05,
                                                          decoration: TextDecoration.none,
                                                          height: 0.9,
                                                        ),
                                                      ),
                                              ),
                                            ),
                                          );
                                        }

                                        final int avatarIndex = index - 1;
                                        return GestureDetector(
                                          onTap: isLoading
                                              ? null
                                              : () {
                                                  onAvatarSelected(avatarIndex);
                                                  AudioService().playSoundEffect(SoundEffect.Select.path);
                                                },
                                          child: CutCornerBorderContainer(
                                            backgroundColor: const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                                            borderColor: selectedAvatarIndex == avatarIndex
                                                ? const Color.fromARGB(255, 255, 255, 255)
                                                : const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                                            borderWidth: baseSize * 0.007,
                                            child: Image.asset(
                                              USER_PROFILE_PICTURES[avatarIndex],
                                              fit: BoxFit.contain,
                                              filterQuality: FilterQuality.none,
                                            ),
                                          ),
                                        );
                                      }),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              SizedBox(
                height: baseSize * 0.2,
                child: Container(
                  margin: const EdgeInsets.only(top: 4),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    spacing: baseSize * 0.01,
                    children: [
                      SizedBox(
                        width: baseSize * 0.35,
                        height: baseSize * 0.07,
                        child: Opacity(
                          opacity: isLoading ? 0.5 : 1.0,
                          child: _CardButton(
                            baseSize: baseSize,
                            isLoading: isLoading,
                            label: currentView == LoginPopupView.login
                                ? i18n.translate(LOGIN_BUTTON_KEY)
                                : i18n.translate(LOGIN_POPUP_REGISTER_BUTTON_KEY),
                            onPressed: isLoading
                                ? null
                                : () {
                                    AudioService().playSoundEffect(SoundEffect.Select.path);
                                    onAction();
                                  },
                          ),
                        ),
                      ),
                      SizedBox(
                        width: baseSize * 0.32,
                        height: baseSize * 0.07,
                        child: ColorFiltered(
                          colorFilter: GRAYSCALE_COLOR_FILTER,
                          child: Opacity(
                            opacity: 0.85,
                            child: _CardButton(
                              baseSize: baseSize,
                              label: currentView == LoginPopupView.login
                                  ? i18n.translate(LOGIN_POPUP_SWITCH_TO_REGISTER_KEY)
                                  : i18n.translate(LOGIN_POPUP_SWITCH_TO_LOGIN_KEY),
                              onPressed: isLoading
                                  ? null
                                  : () {
                                      AudioService().playSoundEffect(SoundEffect.Select.path);
                                      onSwitchView(currentView == LoginPopupView.login ? LoginPopupView.register : LoginPopupView.login);
                                    },
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LangActionButton extends StatelessWidget {
  const _LangActionButton({required this.icon, required this.onPressed, required this.label, required this.baseSize});

  final IconData icon;
  final VoidCallback onPressed;
  final String label;
  final double baseSize;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: baseSize * 0.1,
    height: baseSize * 0.1,
    child: EdgeBodyButton(
      leftEdgePath: ASSET_BUTTON_EDGE_1,
      rightEdgePath: ASSET_BUTTON_EDGE_2,
      bodyPath: ASSET_BUTTON_BODY,
      onAction: onPressed,
      child: Text(label, style: BUTTON_TEXT_STYLE(baseSize * 0.05)),
    ),
  );
}

class _CardTitleRow extends StatelessWidget {
  const _CardTitleRow({required this.title, required this.baseSize});

  final String title;
  final double baseSize;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.start,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      Image.asset(ASSET_TITLE_ICON, width: baseSize * 0.07, height: baseSize * 0.07, fit: BoxFit.contain, filterQuality: FilterQuality.none),
      SizedBox(width: baseSize * 0.02),
      Text(title, style: TITLE_TEXT_STYLE(baseSize * 0.06)),
      SizedBox(width: baseSize * 0.02),
      Image.asset(ASSET_TITLE_ICON, width: baseSize * 0.07, height: baseSize * 0.07, fit: BoxFit.contain, filterQuality: FilterQuality.none),
    ],
  );
}

class _CardSettingsRow extends StatelessWidget {
  const _CardSettingsRow({
    required this.label,
    required this.baseSize,
    required this.controller,
    this.obscureText = false,
    this.enabled = true,
    this.keyboardType,
    this.inputFormatters,
  });

  final String label;
  final double baseSize;
  final TextEditingController controller;
  final bool obscureText;
  final bool enabled;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: baseSize * 0.07,
    width: double.infinity,
    child: EdgeBodyButton(
      leftEdgePath: ASSET_SUB_CONTAINER_EDGE_1,
      rightEdgePath: ASSET_SUB_CONTAINER_EDGE_2,
      bodyPath: ASSET_SUB_CONTAINER_BODY,
      opacity: 0.3,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: baseSize * 0.02, vertical: baseSize * 0.005),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(label, style: LABEL_TEXT_STYLE(baseSize * 0.035)),
            SizedBox(
              width: baseSize * 0.25,
              child: CutCornerBorderContainer(
                backgroundColor: LOGIN_INPUT_BG_COLOR,
                borderColor: LOGIN_INPUT_BORDER_COLOR,
                borderWidth: baseSize * 0.007,
                child: TextField(
                  controller: controller,
                  obscureText: obscureText,
                  enabled: enabled,
                  keyboardType: keyboardType,
                  inputFormatters: inputFormatters,
                  onTap: () => AudioService().playSoundEffect(SoundEffect.Select.path),
                  decoration: InputDecoration(
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: baseSize * 0.01, vertical: baseSize * 0.01),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: BorderSide.none),
                  ),
                  style: LABEL_TEXT_STYLE(baseSize * 0.035),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _CardButton extends StatelessWidget {
  const _CardButton({required this.baseSize, required this.label, this.onPressed, this.isLoading = false});

  final double baseSize;
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) => EdgeBodyButton(
    leftEdgePath: ASSET_BUTTON_EDGE_1,
    rightEdgePath: ASSET_BUTTON_EDGE_2,
    bodyPath: ASSET_BUTTON_BODY,
    onAction: onPressed,
    child: isLoading
        ? SizedBox(
            height: baseSize * 0.04,
            width: baseSize * 0.04,
            child: const CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Text(label, style: BUTTON_TEXT_STYLE(baseSize * 0.04)),
  );
}
