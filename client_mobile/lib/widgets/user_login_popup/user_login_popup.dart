import 'dart:convert';
import 'dart:math' as math;
import 'dart:ui';

import 'package:client_mobile/consts/auth_errors.dart';
import 'package:client_mobile/consts/avatar_list.dart';
import 'package:client_mobile/consts/login_const.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/error_messages.dart';
import 'package:client_mobile/models/menu_config.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/camera_service/camera_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/cut_corner_container/cut_corner_container.dart';
import 'package:client_mobile/widgets/edge_body_button/edge_body_button.dart';
import 'package:client_mobile/widgets/stat_container/stat_container.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

part 'user_login_popup_const.dart';
part 'user_login_popup_controller.dart';
part 'user_login_popup_widgets.dart';

class UsernameInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    return newValue.copyWith(text: newValue.text.toUpperCase(), selection: newValue.selection);
  }
}

Future<void> showUserLoginPopup(BuildContext context) {
  return showDialog(
    context: context,
    barrierDismissible: false,
    barrierColor: Colors.black54,
    builder: (_) => BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 4.0, sigmaY: 4.0),
      child: const PopScope(
        canPop: false,
        child: Material(
          type: MaterialType.transparency,
          child: Center(child: UserLoginPopup()),
        ),
      ),
    ),
  );
}

class UserLoginPopup extends StatefulWidget {
  const UserLoginPopup({super.key});

  @override
  State<UserLoginPopup> createState() => _UserLoginPopupState();
}

class _UserLoginPopupState extends State<UserLoginPopup> with SingleTickerProviderStateMixin {
  late final UserLoginController _controller;
  late final AnimationController _animController;
  late final Animation<double> _widthAnimation;

  @override
  void initState() {
    super.initState();
    _controller = UserLoginController();
    _controller.init(setState);

    _animController = AnimationController(duration: const Duration(milliseconds: 350), vsync: this);
    _widthAnimation = Tween<double>(
      begin: _LOGIN_WIDTH_FACTOR,
      end: _REGISTER_WIDTH_FACTOR,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _animController.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _onSwitchView(LoginPopupView view) {
    _controller.switchView(view);
    if (view == LoginPopupView.register) {
      _animController.forward();
    } else {
      _animController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
        final double screenWidth = constraints.maxWidth;
        final double screenHeight = constraints.maxHeight - keyboardHeight;

        final double baseWidth;
        final double baseHeight;

        if (screenWidth / screenHeight > ASPECT_RATIO) {
          baseHeight = screenHeight;
          baseWidth = baseHeight * ASPECT_RATIO;
        } else {
          baseWidth = screenWidth;
          baseHeight = baseWidth / ASPECT_RATIO;
        }

        final double baseSize = math.min(baseWidth, baseHeight);
        final double cardHeight = baseSize * 0.9;
        final double verticalBleed = baseSize * 0.03;

        return Padding(
          padding: EdgeInsets.only(bottom: keyboardHeight),
          child: SizedBox(
            height: cardHeight + verticalBleed * 2,
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: verticalBleed),
              child: AnimatedBuilder(
                animation: _widthAnimation,
                builder: (BuildContext context, Widget? child) {
                  return SizedBox(width: baseSize * _widthAnimation.value, child: child);
                },
                child: _LoginCardFace(
                  baseSize: baseSize,
                  currentView: _controller.currentView,
                  onSwitchView: _onSwitchView,
                  usernameController: _controller.usernameController,
                  emailController: _controller.emailController,
                  passwordController: _controller.passwordController,
                  confirmPasswordController: _controller.confirmPasswordController,
                  selectedLanguage: _controller.selectedLanguage,
                  onLanguageSwitch: (lang) {
                    _controller.switchLanguage(lang);
                  },
                  selectedAvatarIndex: _controller.selectedAvatarIndex,
                  isCustomAvatarSelected: _controller.isCustomAvatarSelected,
                  customAvatarDataUrl: _controller.customAvatarDataUrl,
                  onAvatarSelected: _controller.selectAvatar,
                  onCustomAvatarTapped: _controller.onCustomAvatarTapped,
                  isLoading: _controller.isLoading,
                  errorMessage: _controller.errorMessage,
                  onAction: () => _controller.handleAction(
                    onSuccess: () {
                      if (mounted) Navigator.of(context).pop();
                    },
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
