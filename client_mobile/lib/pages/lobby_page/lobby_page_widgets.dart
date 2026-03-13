import 'package:client_mobile/widgets/pressable_background/pressable_background.dart';
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
  });

  final String code;
  final bool isAdmin;
  final bool isLocked;

  final TextStyle labelStyle;
  final TextStyle codeStyle;

  final VoidCallback onToggleLock;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 16 / 9,
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
                child: Text(CODE_LABEL_TEXT, style: labelStyle),
              ),
            ),
            Expanded(
              flex: 7,
              child: Align(
                alignment: Alignment.center,
                child: Text(code, style: codeStyle),
              ),
            ),
            Expanded(
              flex: 8,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final panelHeight = constraints.maxHeight;

                  final optionBoxHeight = panelHeight * 0.5;
                  final optionBoxGap = optionBoxHeight;
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
                            backgroundAsset: BLUE_BUTTON_ASSET,
                            backgroundActiveAsset: BLUE_BUTTON_ACTIVE_ASSET,
                            iconAsset: lockIcon,
                            displayBackground: isAdmin,
                            enabled: isAdmin,
                            onTap: onToggleLock,
                          ),
                          SizedBox(width: optionBoxGap),
                          PressableOptionBox(
                            height: optionBoxHeight,
                            backgroundAsset: GREEN_BUTTON_ASSET,
                            backgroundActiveAsset: GREEN_BUTTON_ACTIVE_ASSET,
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
    required this.backgroundAsset,
    required this.backgroundActiveAsset,
    required this.iconAsset,
    this.displayBackground = true,
    this.enabled = true,
    this.onTap,
  });

  final double height;
  final String backgroundAsset;
  final String backgroundActiveAsset;
  final String iconAsset;

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
                ? PressableBackground(
                    backgroundAsset: backgroundAsset,
                    activeBackgroundAsset: backgroundActiveAsset,
                    onTap: onTap ?? () {},
                    child: icon,
                  )
                : GestureDetector(onTap: onTap, behavior: HitTestBehavior.opaque, child: icon),
          ),
        ),
      ),
    );
  }
}
