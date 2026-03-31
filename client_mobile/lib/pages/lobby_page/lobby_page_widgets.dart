import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/widgets/cut_out_button/cut_out_button.dart';
import 'package:flutter/material.dart';

import 'lobby_page_const.dart';

class LobbyCodePanel extends StatelessWidget {
  const LobbyCodePanel({
    super.key,
    required this.code,
    required this.isAdmin,
    required this.isLocked,
    required this.labelStyle,
    required this.codeStyle,
    required this.onToggleLock,
    required this.onCopy,
    required this.onSettings,
  });

  final String code;
  final bool isAdmin;
  final bool isLocked;

  final TextStyle labelStyle;
  final TextStyle codeStyle;

  final VoidCallback onToggleLock;
  final VoidCallback onCopy;
  final VoidCallback onSettings;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 16 / 11,
      child: DecoratedBox(
        decoration: const BoxDecoration(
          image: DecorationImage(image: AssetImage(CODE_CONTAINER_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
        ),
        child: Column(
          children: [
            Expanded(
              flex: 5,
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Text(I18nService().translate(CODE_LABEL_KEY), style: labelStyle),
              ),
            ),
            Expanded(
              flex: 7,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final boxHeight = constraints.maxHeight;
                  final boxWidth = boxHeight * 0.5;
                  final sideInset = boxHeight * 0.85;

                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Align(
                        alignment: Alignment.center,
                        child: Text(code, style: codeStyle),
                      ),
                      Positioned(
                        left: sideInset,
                        top: 0,
                        child: SizedBox(
                          width: boxWidth,
                          height: boxHeight,
                          child: Column(
                            children: [
                              Expanded(
                                child: Center(
                                  child: Image.asset(
                                    DROP_ICON_ASSET,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                    color: Color(0xFFaae7f7).withValues(alpha: MatchService().matchData!.lobbyData.isDropInEnabled ? 1 : 0.3),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Center(
                                  child: Image.asset(
                                    ELEMENTAL_ICON_ASSET,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                    color: const Color(0xFFaae7f7).withValues(alpha: MatchService().matchData!.playData.isElementalMode ? 1 : 0.3),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Center(
                                  child: Image.asset(
                                    RAPID_ELIMINATION_ICON_ASSET,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                    color: const Color(
                                      0xFFaae7f7,
                                    ).withValues(alpha: MatchService().matchData!.lobbyData.isRapidElimination ? 1 : 0.3),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        right: sideInset,
                        top: 0,
                        child: SizedBox(
                          width: boxWidth,
                          height: boxHeight * 0.3,
                          child: Center(
                            child: Image.asset(
                              MatchService().matchData!.lobbyData.isFriendOnly ? FRIEND_ONLY_ICON_ASSET : OPEN_ICON_ASSET,
                              fit: BoxFit.contain,
                              filterQuality: FilterQuality.none,
                              color: const Color(0xFFaae7f7),
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            Expanded(
              flex: 8,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final panelHeight = constraints.maxHeight * 0.8;

                  final optionBoxHeight = panelHeight * 0.5;
                  final optionBoxGap = optionBoxHeight * 0.5;
                  final bottomPadding = panelHeight * 0.15;

                  final lockIcon = isLocked ? LOCK_ICON_ASSET : UNLOCK_ICON_ASSET;

                  return Padding(
                    padding: EdgeInsets.only(bottom: bottomPadding),
                    child: Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          PressableOptionBox(
                            height: optionBoxHeight,
                            lightColor: Color(0xFF7bcee6),
                            mainColor: Color(0xFF4ba6c6),
                            darkColor: Color(0xFF2a7a99),
                            iconAsset: lockIcon,
                            displayBackground: isAdmin,
                            enabled: isAdmin,
                            onTap: onToggleLock,
                          ),
                          SizedBox(width: optionBoxGap),
                          if (isAdmin) ...[
                            PressableOptionBox(
                              height: optionBoxHeight,
                              lightColor: Color.fromARGB(255, 208, 208, 208),
                              mainColor: Color.fromARGB(255, 160, 160, 160),
                              darkColor: Color.fromARGB(255, 96, 96, 96),
                              iconAsset: SETTINGS_ICON_ASSET,
                              displayBackground: true,
                              enabled: isAdmin,
                              onTap: onSettings,
                            ),
                            SizedBox(width: optionBoxGap),
                          ],
                          PressableOptionBox(
                            height: optionBoxHeight,
                            lightColor: Color(0xFFd0f0d0),
                            mainColor: Color(0xFF90c890),
                            darkColor: Color(0xFF407540),
                            iconAsset: COPY_ICON_ASSET,
                            displayBackground: true,
                            enabled: true,
                            onTap: onCopy,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PressableOptionBox extends StatelessWidget {
  const PressableOptionBox({
    super.key,
    required this.height,
    required this.iconAsset,
    required this.darkColor,
    required this.lightColor,
    required this.mainColor,
    this.displayBackground = true,
    this.enabled = true,
    this.onTap,
  });

  final double height;
  final String iconAsset;
  final Color darkColor;
  final Color lightColor;
  final Color mainColor;

  final bool displayBackground;
  final bool enabled;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final icon = Center(
      child: Image.asset(iconAsset, height: height * 0.6, fit: BoxFit.fitHeight, filterQuality: FilterQuality.none),
    );

    return SizedBox(
      height: height,
      child: AspectRatio(
        aspectRatio: 38 / 19,
        child: IgnorePointer(
          ignoring: !enabled,
          child: Opacity(
            opacity: enabled ? 1.0 : 0.5,
            child: displayBackground
                ? CutOutButton(darkColor: darkColor, lightColor: lightColor, mainColor: mainColor, onAction: onTap, child: icon)
                : GestureDetector(onTap: onTap, behavior: HitTestBehavior.opaque, child: icon),
          ),
        ),
      ),
    );
  }
}
