import 'package:client_mobile/consts/avatar_list.dart';
import 'package:client_mobile/consts/login_const.dart';
import 'package:client_mobile/controllers/login_controller.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/binary_toggle/binary_toggle.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'login_popup_consts.dart';

class UsernameInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    return newValue.copyWith(text: newValue.text.toUpperCase(), selection: newValue.selection);
  }
}

class LoginPopup extends StatefulWidget {
  const LoginPopup({super.key});

  @override
  State<LoginPopup> createState() => _LoginPopupState();
}

class _LoginPopupState extends State<LoginPopup> {
  late LoginController _controller;

  @override
  void initState() {
    super.initState();
    _controller = LoginController();
    _controller.init(setState);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();

    return Dialog(
      child: Container(
        padding: const EdgeInsets.all(16.0),
        height: 620,
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    i18n.translate(_controller.isRegister ? LOGIN_POPUP_CREATE_ACCOUNT_TITLE : LOGIN_POPUP_SIGN_IN_TITLE),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 12),
                BinaryToggle(
                  leftSelected: _controller.currentLanguage == AppLanguage.French,
                  enabled: !_controller.isLoading,
                  leftLabel: i18n.translate(LOGIN_POPUP_LANGUAGE_FRENCH),
                  rightLabel: i18n.translate(LOGIN_POPUP_LANGUAGE_ENGLISH),
                  onChanged: (isFrench) {
                    _controller.selectLanguage(isFrench ? AppLanguage.French : AppLanguage.English);
                  },
                ),
              ],
            ),
            if (_controller.isRegister)
              TextField(
                controller: _controller.emailController,
                enabled: !_controller.isLoading,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: i18n.translate(LOGIN_POPUP_EMAIL_LABEL),
                  hintText: i18n.translate(LOGIN_POPUP_EMAIL_HINT),
                  prefixIcon: const Icon(Icons.email),
                ),
                onTap: () => AudioService().playSoundEffect(SoundEffect.Select.path),
              ),
            if (_controller.isRegister)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(i18n.translate(LOGIN_POPUP_CHOOSE_AVATAR_LABEL)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: USER_PROFILE_PICTURES.map((avatarPath) {
                      final isSelected = _controller.selectedAvatar == avatarPath;
                      return GestureDetector(
                        onTap: _controller.isLoading
                            ? null
                            : () => {_controller.selectAvatar(avatarPath), AudioService().playSoundEffect(SoundEffect.Select.path)},
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: BoxDecoration(
                            border: Border.all(color: isSelected ? Colors.blue : Colors.transparent, width: 2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Image.asset(avatarPath, width: 40, height: 40, fit: BoxFit.contain),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            TextField(
              controller: _controller.usernameController,
              enabled: !_controller.isLoading,
              inputFormatters: [UsernameInputFormatter(), LengthLimitingTextInputFormatter(MAX_USERNAME_LENGTH)],
              decoration: InputDecoration(
                labelText: i18n.translate(LOGIN_POPUP_USERNAME_LABEL),
                hintText: i18n.translate(LOGIN_POPUP_USERNAME_HINT),
                prefixIcon: Icon(Icons.person)
              ),
              onTap: () => AudioService().playSoundEffect(SoundEffect.Select.path),
            ),
            TextField(
              controller: _controller.passwordController,
              enabled: !_controller.isLoading,
              obscureText: true,
              decoration: InputDecoration(
                labelText: i18n.translate(LOGIN_POPUP_PASSWORD_LABEL),
                hintText: i18n.translate(LOGIN_POPUP_PASSWORD_HINT),
                prefixIcon: const Icon(Icons.lock),
              ),
              onTap: () => AudioService().playSoundEffect(SoundEffect.Select.path),
            ),
            if (_controller.errorMessage != null) Text(_controller.errorMessage!, style: TextStyle(color: Colors.red, fontSize: 12)),
            ElevatedButton(
              onPressed: _controller.isLoading
                  ? null
                  : () {
                      AudioService().playSoundEffect(SoundEffect.Select.path);
                      _controller.handleSubmit(
                        onSuccess: () {
                          if (mounted) {
                            Navigator.pop(context);
                          }
                        },
                      );
                    },
              child: _controller.isLoading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(i18n.translate(_controller.isRegister ? LOGIN_POPUP_REGISTER_BUTTON : LOGIN_POPUP_SIGN_IN_TITLE)),
            ),
            TextButton(
              onPressed: () {
                AudioService().playSoundEffect(SoundEffect.Select.path);
                _controller.toggleRegister();
              },
              child: Text(i18n.translate(_controller.isRegister ? LOGIN_POPUP_ALREADY_HAVE_ACCOUNT : LOGIN_POPUP_CREATE_ACCOUNT_TITLE)),
            ),
          ],
        ),
      ),
    );
  }
}
