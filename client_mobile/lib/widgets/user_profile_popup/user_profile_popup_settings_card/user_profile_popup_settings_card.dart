part of '../user_profile_popup.dart';

class _SettingsCardFace extends StatefulWidget {
  const _SettingsCardFace({required this.baseSize, required this.onBackToFront});

  final double baseSize;
  final VoidCallback onBackToFront;

  @override
  State<_SettingsCardFace> createState() => _SettingsCardFaceState();
}

class _SettingsCardFaceState extends State<_SettingsCardFace> {
  late final SettingsController _controller;

  @override
  void initState() {
    super.initState();
    _controller = SettingsController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _resetAndGoBack() {
    _controller.reset();
    widget.onBackToFront();
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = widget.baseSize;

    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        return Column(
          children: [
            Expanded(
              flex: 2,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: _CardTitleRow(title: I18nService().translate(ACCOUNT_SETTINGS_TITLE), baseSize: baseSize),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      _CardActionButton(icon: Icons.settings, onPressed: _resetAndGoBack, baseSize: baseSize, assetPath: ASSET_ICON_BACK_ARROW),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 6,
              child: Column(
                spacing: baseSize * 0.015,
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: baseSize * 0.12,
                    child: CutCornerBorderContainer(
                      backgroundColor: const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                      borderColor: const Color(0xFFa7dcff),
                      borderWidth: baseSize * 0.007,
                      padding: EdgeInsets.symmetric(horizontal: baseSize * 0.02),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _CardSettingsRow(
                            label: I18nService().translate(USER_POPUP_NEW_USERNAME_LABEL),
                            baseSize: baseSize,
                            controller: _controller.newUsernameController,
                            onChanged: _controller.onUsernameChanged,
                            inputFormatters: [LengthLimitingTextInputFormatter(MAX_USERNAME_LENGTH)],
                            action: _CardUpdateButton(
                              baseSize: baseSize,
                              onPressed: _controller.isUpdatingUsername ? null : _controller.handleEditUsername,
                              isLoading: _controller.isUpdatingUsername,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                    width: double.infinity,
                    height: baseSize * 0.3,
                    child: CutCornerBorderContainer(
                      backgroundColor: const Color.fromARGB(255, 255, 255, 255).withValues(alpha: 0.1),
                      borderColor: const Color(0xFFa7dcff),
                      borderWidth: baseSize * 0.007,
                      padding: EdgeInsets.all(baseSize * 0.02),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _CardSettingsRow(
                            label: I18nService().translate(USER_POPUP_OLD_PASSWORD_LABEL),
                            baseSize: baseSize,
                            controller: _controller.oldPasswordController,
                            onChanged: _controller.onOldPasswordChanged,
                            obscureText: true,
                          ),
                          _CardSettingsRow(
                            label: I18nService().translate(USER_POPUP_NEW_PASSWORD_LABEL),
                            baseSize: baseSize,
                            controller: _controller.newPasswordController,
                            onChanged: _controller.onNewPasswordChanged,
                            obscureText: true,
                          ),
                          _CardSettingsRow(
                            label: I18nService().translate(USER_POPUP_CONFIRM_PASSWORD_PLACEHOLDER),
                            baseSize: baseSize,
                            controller: _controller.confirmNewPasswordController,
                            onChanged: _controller.onConfirmPasswordChanged,
                            obscureText: true,
                            action: _CardUpdateButton(
                              baseSize: baseSize,
                              onPressed: _controller.isUpdatingPassword ? null : _controller.handleEditPassword,
                              isLoading: _controller.isUpdatingPassword,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Expanded(
                    child: SizedBox(
                      width: double.infinity,
                      height: double.infinity,
                      child: Column(
                        children: [
                          Text(
                            _controller.usernameError.isNotEmpty ? _controller.usernameError : '',
                            style: LABEL_TEXT_STYLE(
                              baseSize * 0.03,
                            ).copyWith(fontStyle: FontStyle.italic, color: const Color.fromARGB(255, 255, 0, 0).withValues(alpha: 0.7)),
                            textAlign: TextAlign.center,
                          ),
                          Text(
                            _controller.passwordError.isNotEmpty ? _controller.passwordError : '',
                            style: LABEL_TEXT_STYLE(
                              baseSize * 0.03,
                            ).copyWith(fontStyle: FontStyle.italic, color: const Color.fromARGB(255, 255, 0, 0).withValues(alpha: 0.7)),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 1,
              child: Container(
                padding: EdgeInsets.all(baseSize * 0.01),
                child: SizedBox(
                  width: baseSize * 0.4,
                  child: EdgeBodyButton(
                    leftEdgePath: ASSET_DELETE_BUTTON_EDGE_1,
                    rightEdgePath: ASSET_DELETE_BUTTON_EDGE_2,
                    bodyPath: ASSET_DELETE_BUTTON_BODY,
                    onAction: _controller.showDeleteAccountConfirmation,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(I18nService().translate(DELETE_ACCOUNT_BUTTON_LABEL), style: BUTTON_TEXT_STYLE(baseSize * 0.035)),
                        SizedBox(width: baseSize * 0.01),
                        Image.asset(
                          height: baseSize * 0.04,
                          ASSET_ICON_TRASH,
                          fit: BoxFit.contain,
                          filterQuality: FilterQuality.none,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
