import 'dart:math';

import 'package:client_mobile/consts/elemental_type_const.dart';
import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/cut_out_button/cut_out_button.dart';
import 'package:client_mobile/widgets/default_container/default_container.dart';
import 'package:flutter/material.dart';

import 'character_page_const.dart';

class BorderedBox extends StatelessWidget {
  const BorderedBox({
    super.key,
    required this.outerWidth,
    required this.innerWidth,
    required this.outerBorderColor,
    required this.innerBorderColor,
    required this.child,
    this.showOuterTop = true,
    this.showOuterRight = true,
    this.showOuterBottom = true,
    this.showOuterLeft = true,
  });

  final double outerWidth;
  final double innerWidth;
  final Color outerBorderColor;
  final Color innerBorderColor;
  final Widget child;

  final bool showOuterTop;
  final bool showOuterRight;
  final bool showOuterBottom;
  final bool showOuterLeft;

  @override
  Widget build(BuildContext context) {
    BorderSide outerSide(bool on) => on ? BorderSide(color: outerBorderColor, width: outerWidth) : BorderSide.none;

    return Container(
      decoration: BoxDecoration(
        border: Border(
          top: outerSide(showOuterTop),
          right: outerSide(showOuterRight),
          bottom: outerSide(showOuterBottom),
          left: outerSide(showOuterLeft),
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: innerBorderColor, width: innerWidth),
        ),
        child: child,
      ),
    );
  }
}

TextStyle pixelTextStyle({
  required String fontFamily,
  required Color shadowColor,
  required double fontSize,
  required double height,
  required double letterSpacing,
  required double shadowOffsetX,
}) {
  return TextStyle(
    fontFamily: fontFamily,
    color: Colors.white,
    fontSize: fontSize,
    height: height,
    letterSpacing: letterSpacing,
    shadows: [Shadow(offset: Offset(shadowOffsetX, 0), color: shadowColor, blurRadius: 0)],
  );
}

ColorFilter grayScaleColorFilter() {
  return const ColorFilter.matrix(<double>[0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0, 0, 0, 1, 0]);
}

class CharacterStatsPanel extends StatelessWidget {
  const CharacterStatsPanel({
    super.key,
    required this.baseSize,
    required this.hpOpacity,
    required this.vitOpacity,
    required this.hpBottomText,
    required this.vitBottomText,
    required this.attackIconAsset,
    required this.defenseIconAsset,
    required this.onToggleHpVit,
    required this.onToggleAtkDef,
  });

  final double baseSize;

  final double hpOpacity;
  final double vitOpacity;

  final String hpBottomText;
  final String vitBottomText;

  final String attackIconAsset;
  final String defenseIconAsset;

  final VoidCallback onToggleHpVit;
  final VoidCallback onToggleAtkDef;

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();
    return LayoutBuilder(
      builder: (context, constraints) {
        final gap = baseSize * 0.05;

        final desiredBoxHeight = baseSize * 0.18;
        final desiredBoxWidth = desiredBoxHeight * 114 / 52;

        final boxWidth = min(desiredBoxWidth, (constraints.maxWidth - gap) / 2);
        final boxHeight = min(desiredBoxHeight, (constraints.maxHeight - gap) / 2);

        Widget labeledStatBox({
          required String topText,
          required String bottomText,
          required DefaultContainerConfig containerConfig,
          required String icon,
          VoidCallback? onTap,
          double opacity = 1.0,
        }) {
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: onTap,
            child: Opacity(
              opacity: opacity,
              child: SizedBox(
                width: boxWidth,
                height: boxHeight,
                child: LayoutBuilder(
                  builder: (context, boxConstraints) {
                    final size = min(boxConstraints.maxWidth, boxConstraints.maxHeight);

                    final pad = size * 0.10;
                    final fontSize = size * 0.35;

                    final style = pixelTextStyle(
                      fontFamily: PIXEL_FONT,
                      shadowColor: SHADOW_COLOR,
                      fontSize: fontSize,
                      height: size * 0.002,
                      letterSpacing: 0,
                      shadowOffsetX: fontSize * 0.10,
                    );

                    return Stack(
                      fit: StackFit.expand,
                      clipBehavior: Clip.none,
                      children: [
                        Positioned.fill(
                          child: DefaultContainer(baseSize: size, config: containerConfig),
                        ),
                        Positioned(
                          top: -boxHeight * 0.12,
                          right: -boxHeight * 0.15,
                          width: boxHeight * 1.25,
                          height: boxHeight * 1.25,
                          child: Image.asset(icon, fit: BoxFit.contain, filterQuality: FilterQuality.none),
                        ),
                        Positioned(
                          left: pad * 2.6,
                          top: pad * 2.7,
                          right: pad,
                          child: Text(topText, maxLines: 1, overflow: TextOverflow.ellipsis, style: style),
                        ),
                        Positioned(
                          left: pad,
                          bottom: pad,
                          right: pad,
                          child: Text(bottomText, maxLines: 1, overflow: TextOverflow.ellipsis, style: style),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          );
        }

        Widget statRow({required Widget left, required Widget right}) {
          return Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              left,
              SizedBox(width: gap),
              right,
            ],
          );
        }

        final hpBox = labeledStatBox(
          topText: i18n.translate(STAT_HP_TOP_KEY),
          bottomText: hpBottomText,
          containerConfig: PINK_CONTAINER_CONFIG,
          icon: HEART_ICON_ASSET,
          onTap: onToggleHpVit,
          opacity: hpOpacity,
        );

        final vitBox = labeledStatBox(
          topText: i18n.translate(STAT_VIT_TOP_KEY),
          bottomText: vitBottomText,
          containerConfig: GREEN_CONTAINER_CONFIG,
          icon: LIGHTNING_ICON_ASSET,
          onTap: onToggleHpVit,
          opacity: vitOpacity,
        );

        final atkBox = labeledStatBox(
          topText: i18n.translate(STAT_ATK_TOP_KEY),
          bottomText: i18n.translate(STAT_ATK_BOTTOM_KEY),
          containerConfig: BLUE_CONTAINER_CONFIG,
          icon: attackIconAsset,
          onTap: onToggleAtkDef,
        );

        final defBox = labeledStatBox(
          topText: i18n.translate(STAT_DEF_TOP_KEY),
          bottomText: i18n.translate(STAT_DEF_BOTTOM_KEY),
          containerConfig: ORANGE_CONTAINER_CONFIG,
          icon: defenseIconAsset,
          onTap: onToggleAtkDef,
        );

        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              statRow(left: hpBox, right: vitBox),
              SizedBox(height: gap),
              statRow(left: atkBox, right: defBox),
            ],
          ),
        );
      },
    );
  }
}

class CharacterAvatarGrid extends StatelessWidget {
  const CharacterAvatarGrid({
    super.key,
    required this.baseSize,
    required this.avatarDatas,
    required this.selectedAvatar,
    required this.isAvatarLocked,
    required this.onSelectAvatar,
    required this.selectFrameAsset,
    required this.disabledAvatarOpacity,
    required this.grayScaleFilter,
  });

  final double baseSize;
  final List<AvatarData> avatarDatas;

  final Avatar? selectedAvatar;
  final bool Function(Avatar) isAvatarLocked;
  final void Function(Avatar) onSelectAvatar;

  final String selectFrameAsset;
  final double disabledAvatarOpacity;
  final ColorFilter grayScaleFilter;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const int cols = AVATAR_SELECTION_GRID_COLS;
        const int itemCount = AVATAR_SELECTION_ITEM_COUNT;
        final rows = (itemCount / cols).ceil();

        final padding = baseSize * 0.01;
        var gap = baseSize * 0.01;

        final innerW = max(0, constraints.maxWidth - 2 * padding);
        final innerH = max(0, constraints.maxHeight - 2 * padding);

        final maxGapW = innerW / 20;
        final maxGapH = innerH / 20;
        gap = gap.clamp(0.0, min(maxGapW, maxGapH));

        final maxCellW = (innerW - (cols - 1) * gap) / cols;
        final maxCellH = (innerH - (rows - 1) * gap) / rows;

        final cell = min(maxCellW, maxCellH);

        final gridW = cols * cell + (cols - 1) * gap;
        final gridH = rows * cell + (rows - 1) * gap;

        return Padding(
          padding: EdgeInsets.all(padding),
          child: Center(
            child: SizedBox(
              width: gridW,
              height: gridH,
              child: GridView.builder(
                padding: EdgeInsets.zero,
                itemCount: itemCount,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: cols,
                  crossAxisSpacing: gap,
                  mainAxisSpacing: gap,
                  childAspectRatio: 1.0,
                ),
                itemBuilder: (context, index) {
                  final avatar = Avatar.values[index + 1];
                  final isSelected = selectedAvatar == avatar;
                  final isLocked = isAvatarLocked(avatar);

                  final avatarImage = Image.asset(
                    avatarDatas[index + 1].image,
                    width: cell * 0.55,
                    height: cell * 0.55,
                    fit: BoxFit.cover,
                    filterQuality: FilterQuality.none,
                  );

                  final filteredAvatarImage = isLocked
                      ? ColorFiltered(
                          colorFilter: grayScaleFilter,
                          child: Opacity(opacity: disabledAvatarOpacity, child: avatarImage),
                        )
                      : avatarImage;

                  final elementalTypeLabelConfig = ELEMENTAL_TYPE_LABEL_CONFIG[AVATAR_ELEMENT_TYPE_MAP[avatar]]!;
                  final cutOutButton = Positioned(
                    bottom: cell * 0.15,
                    right: cell * 0.15,
                    child: SizedBox(
                      height: cell * 0.25,
                      width: cell * 0.55,
                      child: CutOutButton(
                        darkColor: elementalTypeLabelConfig.darkColor,
                        lightColor: elementalTypeLabelConfig.lightColor,
                        mainColor: elementalTypeLabelConfig.mainColor,
                        opacity: isSelected ? null : 0.4,
                        child: Text(
                          I18nService().translate(elementalTypeLabelConfig.textKey),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: pixelTextStyle(
                            fontFamily: PIXEL_FONT,
                            shadowColor: SHADOW_COLOR,
                            fontSize: cell * 0.15,
                            height: 1,
                            letterSpacing: 0,
                            shadowOffsetX: cell * 0.02,
                          ),
                        ),
                      ),
                    ),
                  );

                  return GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: isLocked ? null : () => onSelectAvatar(avatar),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        if (isSelected)
                          Image.asset(selectFrameAsset, width: cell, height: cell, fit: BoxFit.cover, filterQuality: FilterQuality.none),
                        if (!isSelected) cutOutButton,
                        filteredAvatarImage,
                        if (isSelected) cutOutButton,
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }
}
