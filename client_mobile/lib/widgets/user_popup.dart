import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/services/user_service.dart';
import 'package:client_mobile/widgets/login_popup.dart';
import 'package:flutter/material.dart';

class UserPopup extends StatelessWidget {
  const UserPopup({super.key});

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
                Text(
                  username,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16),
                ),
              ],
            ),
          );
        },
      ),
      actions: [
        TextButton(
          onPressed: () async {
            await UserService().logout();
            if (!context.mounted) {
              return;
            }
            Navigator.of(context).pop();
            showDialog(
              context: context,
              barrierDismissible: false,
              builder: (context) {
                return const LoginPopup();
              },
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
