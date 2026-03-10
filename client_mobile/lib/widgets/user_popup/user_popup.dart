import 'package:client_mobile/consts/popup_message_const.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/user_info.dart';
import 'package:client_mobile/services/chat_service/chat_service.dart';
import 'package:client_mobile/services/popup_service.dart';
import 'package:client_mobile/services/user_service.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/login_popup/login_popup.dart';
import 'package:flutter/material.dart';

import 'user_popup_consts.dart';

class UserPopup extends StatefulWidget {
  const UserPopup({super.key});

  @override
  State<UserPopup> createState() => _UserPopupState();
}

class _UserPopupState extends State<UserPopup> {
  bool _editMode = false;
  String _oldPassword = '';
  String _newPassword = '';
  String _passwordError = '';

  void _showLoginDialog() {
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
    try {
      await UserService().logout();
      ChatService().clearChatHistory();
      if (!mounted) {
        return;
      }
      _showLoginDialog();
    } catch (e) {
      PopupService().showPopup(PopupMessage(message: e.toString(), hasCloseButton: true, isConfirmation: false));
    }
  }

  Future<void> _handleDeleteAccount() async {
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
      PopupService().showPopup(PopupMessage(message: e.toString(), hasCloseButton: true, isConfirmation: false));
    }
  }

  Future<void> _handleEditPassword() async {
    final currentUser = UserService().currentUser.value;
    if (currentUser == null || _oldPassword.trim().isEmpty || _newPassword.trim().isEmpty) {
      setState(() {
        _passwordError = USER_POPUP_REQUIRED_FIELDS_ERROR;
      });
      return;
    }

    try {
      await UserService().edit(currentUser.userId, _oldPassword.trim(), _newPassword.trim());
      setState(() {
        _editMode = false;
        _oldPassword = '';
        _newPassword = '';
        _passwordError = '';
      });
      PopupService().showPopup(PopupMessage(message: PopupMessageConst.changeConfirmed.message, hasCloseButton: true, isConfirmation: false));
    } catch (e) {
      setState(() {
        _passwordError = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text(USER_POPUP_TITLE),
      content: ValueListenableBuilder<UserInfo?>(
        valueListenable: UserService().currentUser,
        builder: (context, user, _) {
          final username = user?.username ?? USER_POPUP_UNKNOWN_USER;
          final email = user?.email ?? USER_POPUP_UNKNOWN_EMAIL;
          final avatar = profilePictureImageProvider(
            user?.profilePicture,
            fallback: const AssetImage('assets/images/menu/pokemons/chibi/pikachu.png'),
          );
          return SizedBox(
            width: 240,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 4),
                CircleAvatar(radius: 30, backgroundImage: avatar),
                const SizedBox(height: 8),
                Text(username, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 6),
                Text(email, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14)),
                if (_editMode) ...[
                  const SizedBox(height: 12),
                  TextField(
                    obscureText: true,
                    onChanged: (value) => _oldPassword = value,
                    decoration: const InputDecoration(labelText: USER_POPUP_OLD_PASSWORD_LABEL, isDense: true),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    obscureText: true,
                    onChanged: (value) => _newPassword = value,
                    decoration: const InputDecoration(labelText: USER_POPUP_NEW_PASSWORD_LABEL, isDense: true),
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
            setState(() {
              _editMode = !_editMode;
              _oldPassword = '';
              _newPassword = '';
              _passwordError = '';
            });
          },
          child: Text(_editMode ? USER_POPUP_CANCEL : USER_POPUP_EDIT_PASSWORD),
        ),
        if (_editMode) TextButton(onPressed: () => _handleEditPassword(), child: const Text(USER_POPUP_CONFIRM)),
        TextButton(
          onPressed: () {
            PopupService().showPopup(
              PopupMessage(
                message: PopupMessageConst.logoutConfirmation.message,
                hasCloseButton: true,
                isConfirmation: true,
                action: () {
                  _handleLogout();
                },
              ),
            );
          },
          child: const Text(USER_POPUP_LOGOUT),
        ),
        TextButton(
          onPressed: () {
            PopupService().showPopup(
              PopupMessage(
                message: USER_POPUP_DELETE_ACCOUNT_CONFIRMATION,
                hasCloseButton: true,
                isConfirmation: true,
                action: () {
                  _handleDeleteAccount();
                },
              ),
            );
          },
          child: const Text(USER_POPUP_DELETE_ACCOUNT),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: const Text(USER_POPUP_CLOSE),
        ),
      ],
    );
  }
}
