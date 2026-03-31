import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/default_container/default_container.dart';
import 'package:client_mobile/widgets/user_profile_image/user_profile_image.dart';
import 'package:flutter/material.dart';

import 'player_card_const.dart';

class ActionButton extends StatelessWidget {
  const ActionButton({super.key, required this.isPressed, required this.onPressedChanged, this.onTap});

  final bool isPressed;
  final ValueChanged<bool> onPressedChanged;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final buttonAsset = isPressed ? ACTION_BUTTON_PRESSED_ASSET : ACTION_BUTTON_ASSET;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => onPressedChanged(true),
      onTapUp: (_) => onPressedChanged(false),
      onTapCancel: () => onPressedChanged(false),
      onTap: onTap,
      child: Stack(
        fit: StackFit.expand,
        alignment: Alignment.center,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              image: DecorationImage(image: AssetImage(buttonAsset), fit: BoxFit.contain, filterQuality: FilterQuality.none),
            ),
          ),
          const Center(
            child: FractionallySizedBox(
              widthFactor: 0.7,
              child: Image(image: AssetImage(ACTION_ICON_ASSET), fit: BoxFit.contain, filterQuality: FilterQuality.none, color: ACTION_ICON_TINT),
            ),
          ),
        ],
      ),
    );
  }
}

class PlayerCardBody extends StatelessWidget {
  const PlayerCardBody({
    super.key,
    this.child,
    required this.isInactive,
    required this.inactiveLabel,
    required this.username,
    required this.hpValue,
    required this.usernameIcon,
    required this.userProfilePicture,
    required this.containerConfig,
    required this.inactiveBodyFilter,
  });

  final Widget? child;
  final bool isInactive;

  final String inactiveLabel;

  final String username;
  final String hpValue;
  final String usernameIcon;
  final String userProfilePicture;

  final DefaultContainerConfig containerConfig;
  final ColorFilter? inactiveBodyFilter;

  TextStyle _pixelTextStyle(double fontSize) {
    return TextStyle(
      fontFamily: PIXEL_FONT,
      color: Colors.white,
      fontSize: fontSize,
      height: 0.9,
      shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), color: SHADOW_COLOR, blurRadius: 0)],
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final bodyWidth = constraints.maxWidth;
        final bodyHeight = constraints.maxHeight;

        final edgeWidth = (bodyHeight * EDGE_WIDTH_TO_HEIGHT_RATIO).clamp(0.0, bodyWidth / 2);

        final inactiveFontSize = bodyHeight * 0.6;
        final inactiveStyle = TextStyle(
          fontFamily: PIXEL_FONT,
          color: INACTIVE_TEXT_COLOR,
          fontSize: inactiveFontSize,
          height: 0.9,
          shadows: [Shadow(offset: Offset(inactiveFontSize * 0.10, 0), color: INACTIVE_TEXT_SHADOW_COLOR, blurRadius: 0)],
        );

        if (isInactive) {
          final inactiveLabelLeft = bodyHeight * 0.6;
          final inactiveLabelTop = bodyHeight * 0.2;

          return Stack(
            fit: StackFit.expand,
            clipBehavior: Clip.hardEdge,
            children: [
              inactiveBodyFilter != null
                  ? ColorFiltered(
                      colorFilter: inactiveBodyFilter!,
                      child: DefaultContainer(baseSize: bodyHeight, config: containerConfig),
                    )
                  : DefaultContainer(baseSize: bodyHeight, config: containerConfig),
              Positioned(
                left: inactiveLabelLeft,
                top: inactiveLabelTop,
                right: edgeWidth * 0.6,
                child: Text(inactiveLabel, style: inactiveStyle, maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
            ],
          );
        }

        final fontSize = bodyHeight * 0.3;
        final pixelStyle = _pixelTextStyle(fontSize);

        final hpBarHeight = bodyHeight * 0.25;
        final hpBarWidth = hpBarHeight * HP_BAR_WIDTH_TO_HEIGHT_RATIO;

        final iconSize = fontSize * 0.9;
        final iconGap = fontSize * 0.25;

        final hpBarRightOffset = bodyHeight * 0.15;
        final hpBarBottomOffset = bodyHeight * 0.35;

        final usernameLeftOffset = bodyHeight * 0.7;
        final usernameTopOffset = bodyHeight * 0.2;

        final hpValueRightOffset = bodyHeight * 0.4;
        final hpValueBottomOffset = bodyHeight * 0.06;

        final hasUsernameIcon = usernameIcon.trim().isNotEmpty;
        final hasProfilePic = userProfilePicture.trim().isNotEmpty;

        return Stack(
          fit: StackFit.expand,
          clipBehavior: Clip.hardEdge,
          children: [
            DefaultContainer(baseSize: bodyHeight, config: containerConfig),
            Positioned(
              bottom: hpBarBottomOffset,
              right: hpBarRightOffset,
              width: hpBarWidth,
              height: hpBarHeight,
              child: const DecoratedBox(
                decoration: BoxDecoration(
                  image: DecorationImage(image: AssetImage(HP_BAR_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                ),
              ),
            ),
            Positioned(
              left: usernameLeftOffset,
              top: usernameTopOffset,
              right: edgeWidth * 0.6,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Flexible(
                    fit: FlexFit.loose,
                    child: Text(username, style: pixelStyle, maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                  if (hasUsernameIcon) ...[
                    SizedBox(width: iconGap),
                    SizedBox(
                      width: iconSize,
                      height: iconSize,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          image: DecorationImage(image: AssetImage(usernameIcon), fit: BoxFit.contain, filterQuality: FilterQuality.none),
                        ),
                      ),
                    ),
                  ],
                  if (hasProfilePic) ...[
                    SizedBox(width: iconGap),
                    SizedBox(
                      width: iconSize * 1.3,
                      height: iconSize * 1.3,
                      child: LayeredProfileImage(foregroundImage: profilePictureImageProvider(userProfilePicture)),
                    ),
                  ],
                ],
              ),
            ),
            Positioned(
              right: hpValueRightOffset,
              bottom: hpValueBottomOffset,
              child: Text(hpValue, style: pixelStyle, maxLines: 1, overflow: TextOverflow.ellipsis),
            ),
          ],
        );
      },
    );
  }
}
