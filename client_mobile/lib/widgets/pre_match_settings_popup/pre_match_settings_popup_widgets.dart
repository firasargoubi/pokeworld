import 'dart:math';

import 'package:flutter/material.dart';

class PreMatchSettingsOptionButton extends StatelessWidget {
  const PreMatchSettingsOptionButton({
    super.key,
    required this.text,
    required this.selected,
    required this.hasIcon,
    required this.style,
    required this.onTap,
    this.iconAsset,
  });

  final String text;
  final bool selected;
  final bool hasIcon;
  final TextStyle style;
  final VoidCallback onTap;
  final String? iconAsset;

  @override
  Widget build(BuildContext context) {
    final borderWidth = max(1.0, style.fontSize! * 0.15);
    final checkboxSize = style.fontSize! * 1.0;
    final checkboxInnerPadding = checkboxSize * 0.10;
    final padding = style.fontSize! * 0.2;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Checkbox
          Container(
            width: checkboxSize,
            height: checkboxSize,
            padding: EdgeInsets.all(checkboxInnerPadding),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: borderWidth),
            ),
            child: selected ? Container(color: Colors.white) : const SizedBox(),
          ),
          SizedBox(width: padding),
          if (hasIcon)
            SizedBox(
              width: checkboxSize,
              height: checkboxSize,
              child: iconAsset != null
                  ? Image.asset(iconAsset!, fit: BoxFit.contain, color: Colors.white)
                  : DecoratedBox(
                      decoration: BoxDecoration(border: Border.all(color: Colors.white)),
                    ),
            ),
          if (hasIcon) SizedBox(width: padding),
          Text(text, style: style),
        ],
      ),
    );
  }
}
