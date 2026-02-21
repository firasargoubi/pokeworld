import 'package:client_mobile/controllers/login_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../consts/chat_const.dart';

class UsernameInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    return newValue.copyWith(
      text: newValue.text.toUpperCase(),
      selection: newValue.selection,
    );
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
        height: 500,
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(_controller.isRegister ? "Créer un compte" : "Se connecter"),
            if (_controller.isRegister)
              TextField(
                controller: _controller.emailController,
                enabled: !_controller.isLoading,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: "Email",
                  hintText: "Entrez votre adresse email",
                  prefixIcon: Icon(Icons.email),
                ),
              ),
            TextField(
              controller: _controller.usernameController,
              enabled: !_controller.isLoading,
              inputFormatters: [
                UsernameInputFormatter(),
                LengthLimitingTextInputFormatter(maxUsernameLength),
              ],
              decoration: InputDecoration(
                labelText: "Nom d'utilisateur",
                hintText: "Entrez votre nom d'utilisateur",
                prefixIcon: Icon(Icons.person),
              ),
            ),
            TextField(
              controller: _controller.passwordController,
              enabled: !_controller.isLoading,
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Mot de passe",
                hintText: "Entrez votre mot de passe",
                prefixIcon: Icon(Icons.lock),
              ),
            ),
            if (_controller.errorMessage != null)
              Text(
                _controller.errorMessage!,
                style: TextStyle(color: Colors.red, fontSize: 12),
              ),
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
                  ? SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(
                      _controller.isRegister ? "S'inscrire" : "Se connecter",
                    ),
            ),
            TextButton(
              onPressed: _controller.toggleRegister,
              child: Text(
                _controller.isRegister
                    ? "J'ai déjà un compte"
                    : "Créer un compte",
              ),
            ),
          ],
        ),
      ),
    );
  }
}
