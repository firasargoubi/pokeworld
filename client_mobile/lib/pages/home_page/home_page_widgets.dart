import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/consts/menu_card_data.dart';
import 'package:client_mobile/models/menu_config.dart';
import 'package:client_mobile/pages/create_page/create_page.dart';
import 'package:client_mobile/pages/join_page/join_page.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/menu_card/menu_card.dart';
import 'package:client_mobile/widgets/pressable_background/pressable_background.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'home_page_const.dart';

class HomePageBlurredBackground extends StatelessWidget {
  const HomePageBlurredBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Image.asset(HOME_PAGE_BACKGROUND_ASSET, fit: BoxFit.cover, filterQuality: FilterQuality.none),
      ),
    );
  }
}

class HomePageTopSection extends StatelessWidget {
  const HomePageTopSection({super.key, required this.baseSize, required this.onSettingsTap, required this.onAccountTap});

  final double baseSize;
  final VoidCallback onSettingsTap;
  final VoidCallback onAccountTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      flex: 2,
      child: SizedBox(
        width: double.infinity,
        child: Row(
          children: [
            Expanded(
              flex: 10,
              child: SizedBox(
                height: double.infinity,
                child: Align(
                  alignment: Alignment.topCenter,
                  child: Padding(
                    padding: EdgeInsets.only(left: baseSize * 0.02, top: baseSize * 0.05),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        _HomePageTopButton(baseSize: baseSize, iconAsset: HOME_PAGE_ACCOUNT_ICON_ASSET, onTap: onAccountTap),
                        SizedBox(height: baseSize * 0),
                        _HomePageTopButton(baseSize: baseSize, iconAsset: HOME_PAGE_SETTINGS_ICON_ASSET, onTap: onSettingsTap),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            HomePageLogoAndTeam(baseSize: baseSize),
            HomePageMembersList(baseSize: baseSize),
          ],
        ),
      ),
    );
  }
}

class _HomePageTopButton extends StatelessWidget {
  const _HomePageTopButton({required this.baseSize, required this.iconAsset, required this.onTap});

  final double baseSize;
  final String iconAsset;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      flex: 10,
      child: SizedBox(
        height: double.infinity,
        child: Align(
          alignment: Alignment.topCenter,
          child: Padding(
            padding: EdgeInsets.only(left: baseSize * 0.0),
            child: SizedBox(
              width: baseSize * 0.12,
              height: baseSize * 0.15,
              child: PressableBackground(
                backgroundAsset: HOME_PAGE_SETTINGS_BUTTON_ASSET,
                activeBackgroundAsset: HOME_PAGE_SETTINGS_BUTTON_ACTIVE_ASSET,
                onTap: onTap,
                child: Center(
                  child: SvgPicture.asset(
                    iconAsset,
                    width: baseSize * 0.06,
                    height: baseSize * 0.06,
                    colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HomePageLogoAndTeam extends StatelessWidget {
  const HomePageLogoAndTeam({super.key, required this.baseSize});

  final double baseSize;

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();

    return Expanded(
      flex: 60,
      child: SizedBox(
        height: double.infinity,
        child: Stack(
          children: [
            Positioned(
              top: baseSize * 0.07,
              left: baseSize * 0.05,
              child: Transform.rotate(
                angle: -0.1,
                child: Image.asset(HOME_PAGE_LOGO_ASSET, filterQuality: FilterQuality.high, fit: BoxFit.contain, width: baseSize * 0.7),
              ),
            ),
            Positioned(
              top: baseSize * 0.16,
              right: baseSize * 0.12,
              child: Transform.rotate(
                angle: -0.3,
                child: Text(
                  i18n.translate(HOME_PAGE_TEAM_TEXT),
                  style: TextStyle(
                    fontFamily: HOME_PAGE_PIXEL_FONT,
                    color: HOME_PAGE_TEXT_COLOR,
                    fontSize: baseSize * 0.06,
                    shadows: [Shadow(offset: Offset(baseSize * 0.005, 0), color: HOME_PAGE_SHADOW_COLOR, blurRadius: 0)],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HomePageMembersList extends StatelessWidget {
  const HomePageMembersList({super.key, required this.baseSize});

  final double baseSize;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      flex: 35,
      child: SizedBox(
        height: double.infinity,
        child: Padding(
          padding: EdgeInsets.all(baseSize * 0.02),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(MEMBERS_NAMES.length, (index) => HomePageMemberRow(baseSize: baseSize, index: index)),
          ),
        ),
      ),
    );
  }
}

class HomePageMemberRow extends StatelessWidget {
  const HomePageMemberRow({super.key, required this.baseSize, required this.index});

  final double baseSize;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Flexible(
          child: Text(
            MEMBERS_NAMES[index],
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontFamily: HOME_PAGE_PIXEL_FONT,
              color: HOME_PAGE_TEXT_COLOR,
              fontSize: baseSize * 0.04,
              height: 0.8,
              shadows: [Shadow(offset: Offset(baseSize * 0.003, 0), color: HOME_PAGE_SHADOW_COLOR, blurRadius: 0)],
            ),
          ),
        ),
        SizedBox(width: baseSize * 0.01),
        Container(
          width: baseSize * 0.04,
          height: baseSize * 0.04,
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/images/menu/pokemons/chibi/${MEMBERS_CHIBIS[index]}.png'),
              fit: BoxFit.contain,
              filterQuality: FilterQuality.none,
              alignment: Alignment.center,
            ),
          ),
        ),
      ],
    );
  }
}

class HomePageMiddleSection extends StatelessWidget {
  const HomePageMiddleSection({super.key, required this.baseSize, required this.onPush});

  final double baseSize;
  final Future<void> Function(Widget page) onPush;

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();

    return Expanded(
      flex: 3,
      child: SizedBox(
        width: double.infinity,
        child: Builder(
          builder: (context) {
            final gap = baseSize * 0.055;
            final size = baseSize * 0.6 * 0.9;

            return Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MenuCard(size: size, color: MenuCardColor.Blue, title: i18n.translate(HOME_PAGE_JOIN_TEXT), onTap: () => onPush(const JoinPage())),
                SizedBox(width: gap),
                MenuCard(
                  size: size,
                  color: MenuCardColor.Orange,
                  title: i18n.translate(HOME_PAGE_CREATE_TEXT),
                  onTap: () => onPush(const CreatePage()),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class HomePageBottomLeftChat extends StatelessWidget {
  const HomePageBottomLeftChat({super.key, required this.baseWidth, required this.baseSize, required this.screenHeight, required this.baseHeight});

  final double baseWidth;
  final double baseSize;
  final double screenHeight;
  final double baseHeight;

  @override
  Widget build(BuildContext context) {
    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
    final stackBottomOffset = max(0.0, (screenHeight - baseHeight) / 2);
    final keyboardInStack = max(0.0, keyboardHeight - stackBottomOffset) + baseSize * 0.02;
    final naturalBottom = baseWidth * 0.02;

    return Positioned(
      bottom: max(naturalBottom, keyboardInStack),
      left: baseWidth * 0.01,
      child: Container(
        alignment: Alignment.bottomLeft,
        width: baseSize * 0.8,
        height: baseSize * 0.5,
        child: Chat(baseSize: baseSize * 0.1),
      ),
    );
  }
}
