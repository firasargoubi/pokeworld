import 'dart:math';

import 'package:client_mobile/consts/ui.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/login_popup/login_popup.dart';
import 'package:client_mobile/widgets/user_popup/user_popup.dart';
import 'package:flutter/material.dart';

import 'home_page_widgets.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _didShowLoginPopup = false;
  bool _isSettingsPressed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybeShowLoginPopup());
  }

  void _maybeShowLoginPopup() {
    if (!mounted) return;
    final isLoggedIn = UserService().currentUser.value != null;
    if (!isLoggedIn && !_didShowLoginPopup) {
      _didShowLoginPopup = true;
      _showLoginPopup();
    }
  }

  void _showLoginPopup() {
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return PopScope(canPop: false, onPopInvokedWithResult: (didPop, result) {}, child: const LoginPopup());
      },
    );
  }

  void _showUserPopup() {
    if (!mounted) return;
    showDialog(context: context, barrierDismissible: true, builder: (context) => const UserPopup());
  }

  void _setSettingsPressed(bool pressed) {
    setState(() => _isSettingsPressed = pressed);
  }

  Future<void> _push(Widget page) async {
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
    if (!mounted) return;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          const HomePageBlurredBackground(),
          LayoutBuilder(
            builder: (context, constraints) {
              final screenWidth = constraints.maxWidth;
              final screenHeight = constraints.maxHeight;

              late final double designAspectRatio = HOME_PAGE_ASPECT_RATIO;
              late final double baseWidth;
              late final double baseHeight;

              if (screenWidth / screenHeight > designAspectRatio) {
                baseHeight = screenHeight;
                baseWidth = baseHeight * designAspectRatio;
              } else {
                baseWidth = screenWidth;
                baseHeight = baseWidth / designAspectRatio;
              }

              final baseSize = min(baseWidth, baseHeight);

              return Center(
                child: SizedBox(
                  width: baseWidth,
                  height: baseHeight,
                  child: Stack(
                    children: [
                      Column(
                        children: [
                          HomePageTopSection(
                            baseSize: baseSize,
                            isSettingsPressed: _isSettingsPressed,
                            onSettingsTap: _showUserPopup,
                            onSettingsPressedChanged: _setSettingsPressed,
                          ),
                          HomePageMiddleSection(baseSize: baseSize, onPush: _push),
                        ],
                      ),
                      HomePageBottomLeftChat(baseWidth: baseWidth, baseSize: baseSize, screenHeight: screenHeight, baseHeight: baseHeight),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
