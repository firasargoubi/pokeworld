import 'package:client_mobile/consts/popup_message_const.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/services/chat_service.dart';
import 'package:client_mobile/services/popup_service.dart';
import 'package:client_mobile/services/user_service.dart';
import 'package:client_mobile/widgets/login_popup.dart';
import 'package:flutter/material.dart';

class UserPopup extends StatelessWidget {
  const UserPopup({super.key});

  static Future<void> _handleLogout(BuildContext context) async {
    await UserService().logout();
    ChatService().clearChatHistory();
    if (!context.mounted) {
      return;
    }
    Navigator.of(context).pop();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return PopScope(canPop: false, onPopInvokedWithResult: (didPop, result) {}, child: const LoginPopup());
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Utilisateur'),
      content: ValueListenableBuilder<UserInfo?>(
        valueListenable: UserService().currentUser,
        builder: (context, user, _) {
          final username = user?.username ?? 'Utilisateur inconnu';
          return SizedBox(
            width: 240,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 4),
                Text(username, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16)),
              ],
            ),
          );
        },
      ),
      actions: [
        TextButton(
          onPressed: () {
            PopupService().showPopup(
              PopupMessage(
                message: PopupMessageConst.logoutConfirmation.message,
                hasCloseButton: true,
                isConfirmation: true,
                action: () {
                  _handleLogout(context);
                },
              ),
            );
          },
          child: const Text('Déconnexion'),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: const Text('Fermer'),
        ),
      ],
    );
  }
}
