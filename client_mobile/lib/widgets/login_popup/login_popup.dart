import 'package:client_mobile/consts/avatar_list.dart';
import 'package:client_mobile/consts/login_const.dart';
import 'package:client_mobile/controllers/login_controller.dart';
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
            Text(_controller.isRegister ? LOGIN_POPUP_CREATE_ACCOUNT_TITLE : LOGIN_POPUP_SIGN_IN_TITLE),
            if (_controller.isRegister)
              TextField(
                controller: _controller.emailController,
                enabled: !_controller.isLoading,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: LOGIN_POPUP_EMAIL_LABEL, hintText: LOGIN_POPUP_EMAIL_HINT, prefixIcon: Icon(Icons.email)),
              ),
            if (_controller.isRegister)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(LOGIN_POPUP_CHOOSE_AVATAR_LABEL),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: USER_PROFILE_PICTURES.map((avatarPath) {
                      final isSelected = _controller.selectedAvatar == avatarPath;
                      return GestureDetector(
                        onTap: _controller.isLoading ? null : () => _controller.selectAvatar(avatarPath),
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
              decoration: InputDecoration(labelText: LOGIN_POPUP_USERNAME_LABEL, hintText: LOGIN_POPUP_USERNAME_HINT, prefixIcon: Icon(Icons.person)),
            ),
            TextField(
              controller: _controller.passwordController,
              enabled: !_controller.isLoading,
              obscureText: true,
              decoration: InputDecoration(labelText: LOGIN_POPUP_PASSWORD_LABEL, hintText: LOGIN_POPUP_PASSWORD_HINT, prefixIcon: Icon(Icons.lock)),
            ),
            if (_controller.errorMessage != null) Text(_controller.errorMessage!, style: TextStyle(color: Colors.red, fontSize: 12)),
            ElevatedButton(
              onPressed: _controller.isLoading
                  ? null
                  : () {
                      _controller.handleSubmit(
                        onSuccess: () {
                          if (mounted) {
                            Navigator.pop(context);
                          }
                        },
                      );
                    },
              child: _controller.isLoading
                  ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(_controller.isRegister ? LOGIN_POPUP_REGISTER_BUTTON : LOGIN_POPUP_SIGN_IN_TITLE),
            ),
            TextButton(
              onPressed: _controller.toggleRegister,
              child: Text(_controller.isRegister ? LOGIN_POPUP_ALREADY_HAVE_ACCOUNT : LOGIN_POPUP_CREATE_ACCOUNT_TITLE),
            ),
          ],
        ),
      ),
    );
  }
}
