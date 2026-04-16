import 'dart:math';

import 'package:flutter/material.dart';

class MatchSettingOption extends StatelessWidget {
  const MatchSettingOption({
    super.key,
    required this.text,
    required this.iconAsset,
    required this.selected,
    required this.checkboxSize,
    required this.checkboxInnerPadding,
    required this.labelGap,
    required this.style,
    required this.onTap,
  });

  final String text;
  final String iconAsset;
  final bool selected;

  final double checkboxSize;
  final double checkboxInnerPadding;
  final double labelGap;

  final TextStyle style;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final borderWidth = max(1.0, checkboxSize * 0.15);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: checkboxSize,
            height: checkboxSize,
            padding: EdgeInsets.all(checkboxInnerPadding),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: borderWidth),
            ),
            child: selected ? Container(color: Colors.white) : const SizedBox(),
          ),
          SizedBox(width: labelGap),
          Image.asset(
            iconAsset,
            width: checkboxSize,
            height: checkboxSize * 1.2,
            color: Colors.white,
            colorBlendMode: BlendMode.srcIn,
            fit: BoxFit.contain,
            filterQuality: FilterQuality.none,
          ),
          SizedBox(width: labelGap),
          Text(text, style: style),
        ],
      ),
    );
  }
}
