import 'dart:math';

import 'package:client_mobile/consts/ui.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/widgets/settings_popup/settings_popup.dart';
import 'package:client_mobile/widgets/shop_popup/shop_popup.dart';
import 'package:client_mobile/widgets/user_profile_popup/user_profile_popup.dart';
import 'package:flutter/material.dart';

import 'home_page_widgets.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      AudioService().playBackgroundMusic(BackgroundMusic.Menu.path);
    });
  }

  void _showUserPopup() {
    if (!mounted) return;
    showUserCardPopup(context);
  }

  void _showSettingsPopup() {
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: true,
      useSafeArea: false,
      barrierColor: Colors.transparent,
      builder: (context) => SettingsPopup(onClose: () => Navigator.of(context).pop()),
    );
  }

  void _showShopPopup() {
    if (!mounted) return;
    showShopPopup(context);
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
                            onSettingsTap: _showSettingsPopup,
                            onAccountTap: _showUserPopup,
                            onShopTap: _showShopPopup,
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
